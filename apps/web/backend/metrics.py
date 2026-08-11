"""Minimal, dependency-free metrics registry with a Prometheus text renderer.

WHY THIS FILE EXISTS
--------------------
Logs answer "what happened to ONE request?" Metrics answer "how is the SYSTEM
behaving across MANY requests?" — e.g. "median chat latency is 3s, p95 is 4.5s,
we served 40 requests/hour, 3% of LLM provider calls return 429". You need both.
A log line is a story; a metric is a number you can sum, average, and alert on.

THE THREE METRIC PRIMITIVES (and when to use each)
---------------------------------------------------
1. Counter — a number that can only go UP (like a car's odometer).
   Example: total chat requests, total errors. You count events with it.
2. Gauge — a number that can go up AND down (like a fuel gauge).
   Example: how many requests are in flight right now.
3. Histogram — the DISTRIBUTION of a measurement.
   Each observed value is dropped into one of several "buckets", e.g.
   a 500ms request lands in the "<1000ms" bucket. Later you can read off
   percentiles (p50/p95) — exactly what the eval harness uses to gate the
   <5s time-to-first-token requirement.

WHY THE PROMETHEUS TEXT FORMAT (the `GET /metrics` output)
----------------------------------------------------------
Prometheus is the de-facto standard for scraping metrics, but the *format* is
just plain text anyone can read and grep:
    # HELP <metric> <description>
    # TYPE <metric> <counter|gauge|histogram>
    <metric>{<label>="<value>",...} <number>

Labels let you split one metric by dimensions, e.g.
    provider_requests_total{provider="gemini",model="gemini-3.5-flash-lite",status="200"} 42

WHY HAND-ROLLED AND NOT THE prometheus-client LIBRARY
-----------------------------------------------------
The three primitives above are small enough to write correctly ourselves in
~80 lines. That keeps this project dependency-free and teaches exactly how
counters/buckets work. Because the OUTPUT is the standard Prometheus format,
a real Prometheus server can scrape this endpoint later with zero rework — and
if the project ever needs alert rules, multi-process histograms, or exemplars,
swap this file for `prometheus-client` without touching anything else.
"""

from __future__ import annotations

import threading
from collections import OrderedDict

# Bucket boundaries for latency histograms, in milliseconds.
# A value of 2500 falls into the le="2500" bucket (le = "less than or equal").
DEFAULT_HISTOGRAM_BUCKETS_MS = (1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000)


def _series_line(name: str, labels: dict[str, str] | None, value: float) -> str:
    """Render one Prometheus sample line: `name{labels} value`."""
    if labels:
        label_part = ",".join(f'{k}="{v}"' for k, v in sorted(labels.items()))
        return f'{name}{{{label_part}}} {value}'
    return f"{name} {value}"


class MetricsRegistry:
    """Thread-safe store of counters, gauges, and histograms.

    Every operation takes a short-lived lock. In this single-process FastAPI app
    the lock almost never contends, but logging/requests can come from worker
    threads (e.g. `asyncio.to_thread` for DB calls), so we protect the dicts.
    """

    def __init__(self, buckets: tuple[float, ...] = DEFAULT_HISTOGRAM_BUCKETS_MS):
        self._lock = threading.Lock()
        # Sorted bucket boundaries (prometheus requires ascending "le" values).
        self._buckets = tuple(sorted(float(b) for b in buckets))
        # name -> (type, help text) for the # HELP / # TYPE lines.
        self._help: dict[str, tuple[str, str]] = {}
        # (name, frozenset of label items) -> value. frozenset keeps labels hashable.
        self._counters: dict[tuple, float] = {}
        self._gauges: dict[tuple, float] = {}
        # histograms store {count, sum, buckets: {le_bound: count}} per series.
        self._histograms: dict[tuple, dict] = {}

    # -- registration -------------------------------------------------------

    def register(self, name: str, type_: str, help_text: str) -> None:
        """Declare a metric's type and help text (used for the # TYPE lines).

        Call once at import time next to where the metric is used.
        """
        self._help[name] = (type_, help_text)

    # -- recording ----------------------------------------------------------

    def inc(self, name: str, labels: dict[str, str] | None = None, value: float = 1.0) -> None:
        """Add `value` to a counter. Counters only ever go up."""
        with self._lock:
            key = self._key(name, labels)
            self._counters[key] = self._counters.get(key, 0.0) + value

    def set_gauge(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        """Set a gauge to an absolute value (the value can go up or down)."""
        with self._lock:
            self._gauges[self._key(name, labels)] = float(value)

    def observe(self, name: str, value: float, labels: dict[str, str] | None = None) -> None:
        """Record one observation into a histogram's distribution."""
        value = float(value)
        with self._lock:
            key = self._key(name, labels)
            hist = self._histograms.get(key)
            if hist is None:
                # le="+Inf" is the unbounded top bucket: every observation lands in it.
                hist = self._histograms[key] = {
                    "count": 0.0,
                    "sum": 0.0,
                    "buckets": OrderedDict((le, 0.0) for le in self._buckets),
                    "buckets_inf": 0.0,
                }
            hist["count"] += 1.0
            hist["sum"] += value
            # Every value also increments every bucket whose bound is >= it,
            # so bucket counts are CUMULATIVE: bucket le="5000" includes all
            # observations that landed in le="1000" and le="2500".
            for le in hist["buckets"]:
                if value <= le:
                    hist["buckets"][le] += 1.0
            hist["buckets_inf"] += 1.0

    # -- rendering ----------------------------------------------------------

    def render(self) -> str:
        """Render everything in Prometheus text format (one line per sample)."""
        lines: list[str] = []
        with self._lock:
            for name in sorted(self._help):
                type_, help_text = self._help[name]
                lines.append(f"# HELP {name} {help_text}")
                lines.append(f"# TYPE {name} {type_}")
                if type_ == "counter":
                    lines.extend(
                        _series_line(n, dict(labels), v)
                        for (n, labels), v in sorted(self._counters.items())
                        if n == name
                    )
                elif type_ == "gauge":
                    lines.extend(
                        _series_line(n, dict(labels), v)
                        for (n, labels), v in sorted(self._gauges.items())
                        if n == name
                    )
                elif type_ == "histogram":
                    for (n, labels), hist in sorted(self._histograms.items()):
                        if n != name:
                            continue
                        # One sample per bucket, with the bucket bound as the le label.
                        for le, count in hist["buckets"].items():
                            lines.append(_series_line(f"{name}_bucket", {**dict(labels), "le": f"{le:g}"}, count))
                        lines.append(_series_line(f"{name}_bucket", {**dict(labels), "le": "+Inf"}, hist["buckets_inf"]))
                        lines.append(_series_line(f"{name}_sum", dict(labels), hist["sum"]))
                        lines.append(_series_line(f"{name}_count", dict(labels), hist["count"]))
        return "\n".join(lines) + "\n"

    # -- helpers ------------------------------------------------------------

    @staticmethod
    def _key(name: str, labels: dict[str, str] | None) -> tuple:
        """Build a hashable dict key: (name, frozenset of (label, value) pairs)."""
        return (name, frozenset((labels or {}).items()))


# Module-level singleton so every module in the process shares ONE registry.
metrics = MetricsRegistry()
