"""Unit tests for backend chunking, citation generation, prompts, and classification."""

import io
import json
import logging
import sys
import unittest
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from citation import build_citation_url, heading_to_anchor
from config import CHUNK_MAX_TOKENS
from ingestion import chunk_sections, parse_frontmatter, split_into_sections
from llm import (
    _gemini_status_code,
    _split_gemini_messages,
    build_provider_chain,
    get_provider,
)
from metrics import MetricsRegistry
from observability import (
    JsonFormatter,
    RequestIdFilter,
    RequestMetrics,
    new_request_id,
    set_request_id,
)
from prompts import PRICING_ADDENDUM, build_messages_payload
from rag import is_pricing_query
from schemas import Message, RetrievedChunk


class TestBackend(unittest.TestCase):

    def test_heading_to_anchor(self):
        self.assertEqual(heading_to_anchor("What is Veracity?"), "what-is-veracity")
        self.assertEqual(heading_to_anchor("### What is Veracity?"), "what-is-veracity")
        self.assertEqual(
            heading_to_anchor("How is data encrypted at rest & in transit?"),
            "how-is-data-encrypted-at-rest-in-transit",
        )
        self.assertEqual(heading_to_anchor("  Leading and trailing   "), "leading-and-trailing")

    def test_build_citation_url(self):
        self.assertEqual(build_citation_url("/faq", "what-is-veracity"), "/faq#what-is-veracity")
        self.assertEqual(build_citation_url("pricing", None), "/pricing")
        self.assertEqual(build_citation_url("/resources/scoring", "the-formula"), "/resources/scoring#the-formula")

    def test_parse_frontmatter(self):
        raw_md = """---
title: Custom Page Title
slug: custom-page
order: 2
---

# Main Heading

Some text content here.
"""
        parsed = parse_frontmatter(raw_md, default_slug="default")
        self.assertEqual(parsed.title, "Custom Page Title")
        self.assertEqual(parsed.slug, "custom-page")
        self.assertIn("Some text content here.", parsed.body)

    def test_split_into_sections(self):
        body = """# Page Title

Intro paragraph.

## Section One

Content of section one.

### Subsection A

Content of subsection A.
"""
        sections = split_into_sections("sample-slug", "Sample Page", body)
        self.assertEqual(len(sections), 3)
        self.assertEqual(sections[0].heading_path, "Sample Page")
        self.assertEqual(sections[1].heading_path, "Section One")
        self.assertEqual(sections[2].heading_path, "Section One > Subsection A")
        self.assertEqual(sections[2].anchor_id, "subsection-a")

    def test_chunk_sections_preserves_tables(self):
        table_content = """## Plan Comparison Table

| Feature | Starter | Growth | Enterprise |
| :--- | :--- | :--- | :--- |
| Price | $6/user/mo | $12/user/mo | $24/user/mo |
| Max Users | Up to 10 | Up to 50 | Unlimited |
"""
        sections = split_into_sections("pricing", "Pricing", table_content)
        chunks = chunk_sections(sections)
        self.assertEqual(len(chunks), 1)
        self.assertIn("| Feature | Starter | Growth | Enterprise |", chunks[0].content)

    def test_chunk_sections_keeps_long_tables_intact(self):
        rows = [
            "| Feature | Starter | Growth | Enterprise |",
            "| :--- | :--- | :--- | :--- |",
        ]
        rows.extend(f"| Feature {i} | $6 | $12 | $24 |" for i in range(200))
        table_content = "## Plan Comparison Table\n\n" + "\n".join(rows) + "\n"
        self.assertGreater(len(table_content), CHUNK_MAX_TOKENS * 4)

        sections = split_into_sections("pricing", "Pricing", table_content)
        chunks = chunk_sections(sections)
        self.assertEqual(len(chunks), 1)
        self.assertIn("| Feature 0 |", chunks[0].content)
        self.assertIn("| Feature 199 |", chunks[0].content)

    def test_home_section_page_url(self):
        body = "# Home\n\nIntro.\n\n## Three Plans for Every Team Size\n\nContent."
        sections = split_into_sections("home", "Home", body)
        self.assertEqual(sections[0].page_url, "/")
        self.assertEqual(sections[1].page_url, "/")

    def test_is_pricing_query(self):
        self.assertTrue(is_pricing_query("How much does the Starter plan cost?"))
        self.assertTrue(is_pricing_query("What is the annual billing discount?"))
        self.assertTrue(is_pricing_query("Is there a 14-day free trial?"))
        self.assertFalse(is_pricing_query("Tell me about screenshot blur privacy"))
        self.assertFalse(is_pricing_query("Can it track annual leave?"))
        self.assertFalse(is_pricing_query("How do you plan to handle onboarding?"))
        self.assertFalse(is_pricing_query("Does the agent procrastinate much?"))

    def test_pricing_addendum_matches_corpus(self):
        content_root = Path(__file__).resolve().parent.parent.parent / "content"
        pricing_md = (content_root / "pages" / "pricing.md").read_text(encoding="utf-8").lower()

        for figure in ("$6", "$12", "$24", "$60", "$120", "$240", "$5/mo", "$10/mo", "$20/mo"):
            self.assertIn(figure, pricing_md, f"PRICING_ADDENDUM figure {figure} not in pricing.md")
        self.assertIn("14-day", PRICING_ADDENDUM.lower())
        self.assertTrue(
            "fourteen-day" in pricing_md or "14-day" in pricing_md,
            "Trial length in PRICING_ADDENDUM not grounded in pricing.md",
        )
        self.assertIn("no credit card", pricing_md)

    def test_build_messages_payload_pricing_isolation(self):
        chunks = [
            RetrievedChunk(
                content="| Plan | Price |\n| Starter | $6 |",
                page_url="/pricing",
                heading_path="Pricing > Plans",
                anchor_id="plans",
                page_title="Pricing",
                similarity=0.92,
            )
        ]
        history = [Message(role="user", content="Hello"), Message(role="assistant", content="Hi!")]
        payload = build_messages_payload(
            query="What is the Starter price?",
            context_chunks=chunks,
            history=history,
            is_pricing=True,
        )

        # 1 system + 2 history + 1 user = 4
        self.assertEqual(len(payload), 4)
        system_msg = payload[0]["content"]
        self.assertIn("[PRICING PRECISION MANDATE]", system_msg)
        self.assertIn("<RETRIEVED_CONTEXT>", system_msg)
        self.assertIn("--- Source: /pricing#plans (Pricing > Plans) ---", system_msg)
        self.assertEqual(payload[-1]["content"], "What is the Starter price?")


class TestGeminiMessageMapping(unittest.TestCase):
    """LLM provider layer: OpenAI-style messages -> Gemini request shape."""

    def test_split_removes_system_and_sets_instruction(self):
        messages = [
            {"role": "system", "content": "You are Veracity."},
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "What is pricing?"},
        ]
        contents, system_instruction = _split_gemini_messages(messages)

        # System prompt is extracted into the top-level instruction field.
        self.assertEqual(
            system_instruction and system_instruction["parts"][0]["text"],
            "You are Veracity.",
        )
        # Roles map user -> user, assistant -> model; no system role leaks in.
        self.assertEqual(
            [c["role"] for c in contents], ["user", "model", "user"]
        )
        self.assertEqual(contents[1]["parts"][0]["text"], "Hello!")

    def test_split_merges_consecutive_same_role_messages(self):
        messages = [
            {"role": "user", "content": "First"},
            {"role": "user", "content": "Second"},
            {"role": "assistant", "content": "Reply"},
            {"role": "assistant", "content": "Expanded"},
        ]
        contents, system_instruction = _split_gemini_messages(messages)

        self.assertIsNone(system_instruction)
        self.assertEqual([c["role"] for c in contents], ["user", "model"])
        self.assertEqual(
            [p["text"] for p in contents[0]["parts"]], ["First", "Second"]
        )
        self.assertEqual(
            [p["text"] for p in contents[1]["parts"]], ["Reply", "Expanded"]
        )

    def test_split_unknown_role_falls_back_to_user(self):
        messages = [
            {"role": "system", "content": "Be helpful."},
            {"role": "tool", "content": "tool-result"},
        ]
        contents, system_instruction = _split_gemini_messages(messages)

        self.assertEqual(
            system_instruction and system_instruction["parts"][0]["text"],
            "Be helpful.",
        )
        self.assertEqual([c["role"] for c in contents], ["user"])
        self.assertEqual(contents[0]["parts"][0]["text"], "tool-result")

    def test_gemini_status_code_maps_quota_to_429(self):
        self.assertEqual(
            _gemini_status_code('{"error": {"code": 429, "status": "RESOURCE_EXHAUSTED"}}'),
            429,
        )
        self.assertEqual(
            _gemini_status_code('{"error": {"status": "UNAVAILABLE"}}'),
            503,
        )
        self.assertEqual(
            _gemini_status_code('{"error": {"status": "SOMETHING_ELSE"}}'),
            0,
        )
        self.assertEqual(_gemini_status_code("not json"), 0)

    def test_build_provider_chain_follows_llm_providers_order(self):
        import config

        old_providers = config.LLM_PROVIDERS
        old_gemini_models = config.GEMINI_MODELS
        old_or_models = config.LLM_MODELS
        try:
            config.LLM_PROVIDERS = ["gemini", "openrouter"]
            config.GEMINI_MODELS = ["gemini-2.5-flash"]
            config.LLM_MODELS = ["or-model-a", "or-model-b"]
            chain = build_provider_chain()
        finally:
            config.LLM_PROVIDERS = old_providers
            config.GEMINI_MODELS = old_gemini_models
            config.LLM_MODELS = old_or_models

        names = [(type(p).__name__, m) for p, m in chain]
        self.assertEqual(
            names,
            [
                ("GeminiProvider", "gemini-2.5-flash"),
                ("OpenRouterProvider", "or-model-a"),
                ("OpenRouterProvider", "or-model-b"),
            ],
        )

    def test_get_provider_unknown_name_raises(self):
        with self.assertRaises(ValueError):
            get_provider("nonexistent-provider")


class TestMetricsRegistry(unittest.TestCase):
    """The hand-rolled Prometheus-style registry: counters, gauges, histograms."""

    def setUp(self):
        self.registry = MetricsRegistry()

    def test_counter_increments_and_renders(self):
        self.registry.register("my_counter_total", "counter", "A test counter.")
        self.registry.inc("my_counter_total")
        self.registry.inc("my_counter_total", {"provider": "gemini"})
        text = self.registry.render()
        self.assertIn('# TYPE my_counter_total counter', text)
        self.assertIn('my_counter_total 1.0', text)
        self.assertIn('my_counter_total{provider="gemini"} 1.0', text)

    def test_gauge_sets_absolute_value(self):
        self.registry.register("inflight", "gauge", "In-flight requests.")
        self.registry.set_gauge("inflight", 3.0)
        self.assertIn('inflight 3.0', self.registry.render())

    def test_histogram_distribution_and_cumulative_buckets(self):
        self.registry.register("latency_ms", "histogram", "Latency.")
        for value in (50, 150, 500, 5000):
            self.registry.observe("latency_ms", value)
        text = self.registry.render()
        # Cumulative bucket semantics: 3 of 4 observations are <= 1000ms.
        self.assertIn('latency_ms_bucket{le="1000"} 3.0', text)
        self.assertIn('latency_ms_bucket{le="+Inf"} 4.0', text)
        # Sum and count of the 4 observations.
        self.assertIn('latency_ms_sum 5700.0', text)
        self.assertIn('latency_ms_count 4.0', text)

    def test_unregistered_metric_renders_help_even_when_empty(self):
        self.registry.register("empty_total", "counter", "Never incremented.")
        text = self.registry.render()
        self.assertIn('# TYPE empty_total counter', text)


class TestObservability(unittest.TestCase):
    """Structured JSON logs + request_id correlation."""

    def test_json_formatter_emits_flat_json_with_request_id(self):
        logger = logging.getLogger("test.json_formatter")
        logger.setLevel(logging.INFO)
        logger.propagate = False
        stream = io.StringIO()
        handler = logging.StreamHandler(stream)
        handler.setFormatter(JsonFormatter())
        handler.addFilter(RequestIdFilter())
        logger.addHandler(handler)

        set_request_id("abc123")
        try:
            logger.info("chat_request_completed", extra={"total_ms": 123.4})
        finally:
            logger.removeHandler(handler)
            set_request_id("")

        parsed = json.loads(stream.getvalue())
        self.assertEqual(parsed["level"], "INFO")
        self.assertEqual(parsed["msg"], "chat_request_completed")
        self.assertEqual(parsed["request_id"], "abc123")
        self.assertEqual(parsed["total_ms"], 123.4)
        self.assertIn("ts", parsed)

    def test_request_id_round_trips_and_is_unique(self):
        set_request_id("first")
        self.assertEqual("first", __import__("observability").get_request_id())
        # A fresh id is never the same as the current one.
        self.assertNotEqual(new_request_id(), "first")

    def test_new_request_id_format(self):
        self.assertEqual(len(new_request_id()), 16)  # 8 random bytes -> 16 hex chars

    def test_request_metrics_accumulator(self):
        # The accumulator starts empty; fields are filled as the pipeline runs.
        metrics_ = RequestMetrics()
        metrics_.retrieval_count = 3
        metrics_.total_ms = 99.0
        self.assertEqual(metrics_.retrieval_count, 3)
        self.assertEqual(metrics_.total_ms, 99.0)


if __name__ == "__main__":
    unittest.main()
