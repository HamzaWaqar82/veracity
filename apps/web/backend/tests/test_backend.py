"""Unit tests for backend chunking, citation generation, prompts, and classification."""

import sys
import unittest
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from citation import build_citation_url, heading_to_anchor
from config import CHUNK_MAX_TOKENS
from ingestion import chunk_sections, parse_frontmatter, split_into_sections
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


if __name__ == "__main__":
    unittest.main()
