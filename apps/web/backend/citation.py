"""Citation URL and heading anchor generation utilities."""

import re


def heading_to_anchor(text: str) -> str:
    """Convert a heading text string into a URL anchor slug.

    Matches frontend's slug generation:
    - Lowercase
    - Replace non-alphanumeric characters with hyphens
    - Strip leading and trailing hyphens

    Example:
        "### What is Veracity?" -> "what-is-veracity"
        "How is data encrypted?" -> "how-is-data-encrypted"
    """
    cleaned = text.strip()
    # Strip markdown header hashes if present
    cleaned = re.sub(r"^#+\s*", "", cleaned)
    # Lowercase
    slug = cleaned.lower()
    # Replace non-alphanumeric with hyphens
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    # Strip leading and trailing hyphens
    slug = re.sub(r"^-+|-+$", "", slug)
    return slug


def build_citation_url(page_url: str, anchor_id: str | None = None) -> str:
    """Build a citation URL from a page URL and optional anchor.

    Example:
        build_citation_url("/faq", "what-is-veracity") -> "/faq#what-is-veracity"
        build_citation_url("/pricing", None) -> "/pricing"
    """
    url = page_url if page_url.startswith("/") else f"/{page_url}"
    if anchor_id:
        return f"{url}#{anchor_id}"
    return url
