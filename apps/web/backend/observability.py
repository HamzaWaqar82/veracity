"""Structured logging + per-request correlation for the Veracity backend.

THREE IDEAS IN THIS FILE
------------------------
1. STRUCTURED LOGGING
   Instead of human sentences, every log line is ONE JSON object:
       {"ts":"...","level":"INFO","logger":"rag","msg":"...","request_id":"..."}
   Because each line is self-describing, you can filter with `jq`/`grep` to
   answer questions like "all 429s today" or "every request that took >5s".

2. REQUEST CORRELATION (the request_id)
   Every chat request gets a random id. A logging.Filter reads *the current
   request's* id from a `contextvars.ContextVar` and stamps it onto EVERY log
   line emitted while that request is being handled — from the HTTP handler
   down to the LLM provider call. One id = one request's entire journey:
       jq 'select(.request_id=="3f9a…")' logs/backend.log
   Why a ContextVar and not a global? FastAPI can serve many requests
   concurrently in one process. A global would interleave them. A ContextVar
   is a value that is "attached to the current async task", so each concurrent
   request sees only its own id — no mixing, no explicit passing.

3. REQUEST METRICS (the RequestMetrics dataclass)
   A small accumulator rides in the same ContextVar. Each stage of the pipeline
   (retrieval, LLM call, first token, completion) updates it; when the request
   finishes, the HTTP endpoint logs a single summary line with every number at
   once. This is the "one line per request, all the context you need" pattern.
"""

from __future__ import annotations

import json
import logging
import logging.handlers
import os
import secrets
from contextvars import ContextVar
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import ClassVar

# --- request correlation ---------------------------------------------------

# The id of the request currently being served. Default "" = no request.
# ContextVars propagate automatically through `asyncio` tasks and into
# threads started with `asyncio.to_thread`, so log lines emitted from those
# places still carry the right request_id (or lose it gracefully if not set).
_request_id_var: ContextVar[str] = ContextVar("veracity_request_id", default="")

# The metrics accumulator for the current request (None until one is created).
_request_metrics_var: ContextVar[RequestMetrics | None] = ContextVar(
    "veracity_request_metrics", default=None
)


def new_request_id() -> str:
    """Return a fresh random request id (16 hex chars — plenty for a dev server)."""
    return secrets.token_hex(8)


def get_request_id() -> str:
    """The id of the request currently being handled ('' outside a request)."""
    return _request_id_var.get()


def set_request_id(request_id: str) -> None:
    """Bind `request_id` to the current task/request context."""
    _request_id_var.set(request_id)


@dataclass
class RequestMetrics:
    """Per-request numbers collected across the pipeline and logged at the end.

    Every field is written by whichever stage owns that measurement:
      * started_at / first_token_ms  — set by the HTTP endpoint and rag.py
      * retrieval_count / retrieval_ms — set by rag.py's retrieve_context
      * provider_used / model_used   — set by llm.py on the first 200 response
      * rotation_count               — incremented by rag.py on each fallback
      * char_count                   — final response length
    """

    request_id: str = ""
    started_at: float = 0.0  # time.monotonic() when the HTTP request began
    first_token_ms: float = 0.0  # elapsed ms until the first token was yielded
    total_ms: float = 0.0  # elapsed ms for the whole request
    retrieval_count: int = 0  # chunks returned by the similarity search
    retrieval_ms: float = 0.0  # time spent retrieving + embedding
    provider_used: str = ""  # e.g. "gemini"
    model_used: str = ""  # e.g. "gemini-3.5-flash-lite"
    rotation_count: int = 0  # times the pipeline fell through to the next model
    char_count: int = 0  # total characters streamed to the client
    error: str = ""  # set if the request failed


def current_metrics() -> RequestMetrics:
    """Return the accumulator for the current request, creating it if needed."""
    metrics_ = _request_metrics_var.get()
    if metrics_ is None:
        metrics_ = RequestMetrics()
        _request_metrics_var.set(metrics_)
    return metrics_


# --- logging plumbing ------------------------------------------------------

class RequestIdFilter(logging.Filter):
    """Stamp the current request_id onto every log record that passes through.

    This is added to the ROOT logger's handlers, so every logger in the app
    (rag, llm, database, ...) gets the stamp automatically — no per-module code.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id()
        return True  # never drop a record


class JsonFormatter(logging.Formatter):
    """Format a log record as a single line of JSON.

    Standard fields become ts/level/logger/msg. Any *extra* attributes (the
    request_id from the filter above, or `extra={...}` passed at a call site)
    are merged in too, so every event carries its own context. `default=str`
    lets non-serializable values (e.g. exceptions) still be emitted.
    """

    # Attributes the logging module sets on every record that we don't want in
    # the JSON output (they're implementation details, not signal).
    _RESERVED: ClassVar[frozenset[str]] = frozenset({
        "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
        "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
        "created", "msecs", "relativeCreated", "thread", "threadName",
        "processName", "process", "taskName", "message", "asctime",
    })

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key not in self._RESERVED and not key.startswith("_"):
                payload[key] = value
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def setup_logging() -> None:
    """Configure the root logger once (JSON by default).

    Reads environment variables:
      VERACITY_LOG_LEVEL  — INFO / DEBUG / WARNING / ERROR  (default INFO)
      VERACITY_LOG_FORMAT — "json" or "text"                (default json)
      VERACITY_LOG_FILE   — e.g. "logs/backend.log" (default: backend logs dir)
                            "" disables file logging
      VERACITY_LOG_HTTP   — "1" to keep httpx's per-request INFO logs
    """
    level = os.getenv("VERACITY_LOG_LEVEL", "INFO").upper()
    log_format = os.getenv("VERACITY_LOG_FORMAT", "json").lower()
    log_file = os.getenv("VERACITY_LOG_FILE", "")
    if not log_file:
        # Default to <backend>/../logs/backend.log so logs survive restarts.
        log_file = str(Path(__file__).resolve().parent.parent / "logs" / "backend.log")

    root = logging.getLogger()
    root.setLevel(level)

    # Remove any pre-existing handlers first, so calling setup_logging() twice
    # (tests, reloader) never duplicates output.
    for handler in list(root.handlers):
        root.removeHandler(handler)
        handler.close()

    formatter: logging.Formatter = (
        JsonFormatter() if log_format == "json"
        else logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    rid_filter = RequestIdFilter()

    # 1) Console handler (what you see in the terminal).
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    console.addFilter(rid_filter)
    root.addHandler(console)

    # 2) File handler with rotation: each file is capped at 5 MB, keeps 3
    #    backups (backend.log, backend.log.1, ...) so logs never grow unbounded.
    path = Path(log_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.handlers.RotatingFileHandler(
        path, maxBytes=5_000_000, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    file_handler.addFilter(rid_filter)
    root.addHandler(file_handler)

    # 3) Route uvicorn's own logs (startup + per-request access) through our
    #    formatters too, so the JSON log file is ONE consistent stream.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers = []
        uvicorn_logger.propagate = True

    # 4) httpx logs one INFO line per HTTP request it makes. Our own structured
    #    provider logs (provider_call_completed/failed) are richer, so silence
    #    httpx by default; set VERACITY_LOG_HTTP=1 to see raw HTTP traffic.
    logging.getLogger("httpx").setLevel(
        logging.INFO if os.getenv("VERACITY_LOG_HTTP") == "1" else logging.WARNING
    )
