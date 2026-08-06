"""Markdown content parser, heading-aware chunker, and ingestion pipeline."""

from __future__ import annotations

import argparse
import hashlib
import logging
import re
from pathlib import Path
from typing import NamedTuple

from citation import heading_to_anchor
from config import (
    CHUNK_MAX_TOKENS,
    CHUNK_OVERLAP_TOKENS,
    CONTENT_DIR,
)
from database import (
    delete_page_chunks,
    get_page_by_slug,
    init_db,
    store_chunks,
    upsert_page,
)
from embeddings import embed_texts
from schemas import Chunk, ChunkWithEmbedding, IngestResult, Section

logger = logging.getLogger(__name__)


class ParsedFrontmatter(NamedTuple):
    title: str
    slug: str
    body: str


def parse_frontmatter(raw_text: str, default_slug: str = "") -> ParsedFrontmatter:
    """Extract YAML frontmatter (title, slug) and markdown body."""
    title = ""
    slug = default_slug

    if raw_text.startswith("---"):
        parts = raw_text.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2].strip()

            for line in fm_text.strip().splitlines():
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip().lower()
                    val = val.strip().strip("\"'")
                    if key == "title":
                        title = val
                    elif key == "slug":
                        slug = val

            if not title:
                # Find first H1 in body
                h1_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
                if h1_match:
                    title = h1_match.group(1).strip()

            return ParsedFrontmatter(title=title or default_slug.title(), slug=slug, body=body)

    # No frontmatter
    body = raw_text.strip()
    h1_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if h1_match:
        title = h1_match.group(1).strip()
    else:
        title = default_slug.title()

    return ParsedFrontmatter(title=title, slug=slug or default_slug, body=body)


TABLE_SEPARATOR_RE = re.compile(r"^\s*\|[\s:|-]*-\s*\|[\s:|-]*$", re.MULTILINE)


def split_into_sections(page_slug: str, page_title: str, body: str) -> list[Section]:
    """Parse markdown body into heading-delimited sections."""
    page_url = "/" if page_slug == "home" else f"/{page_slug.lstrip('/')}"
    lines = body.splitlines()

    sections: list[Section] = []
    current_h2 = ""
    current_h3 = ""
    current_heading_text = ""
    current_anchor = ""
    current_lines: list[str] = []

    def commit_section():
        if not current_lines:
            return
        content = "\n".join(current_lines).strip()
        if not content:
            return

        heading_parts = [p for p in [current_h2, current_h3] if p]
        heading_path = " > ".join(heading_parts) if heading_parts else page_title
        anchor = current_anchor

        sections.append(
            Section(
                page_slug=page_slug,
                page_title=page_title,
                heading_path=heading_path,
                heading_text=current_heading_text or page_title,
                anchor_id=anchor,
                content=content,
                page_url=page_url,
            )
        )

    for line in lines:
        stripped = line.strip()

        # Check for H2
        if stripped.startswith("## "):
            commit_section()
            current_lines = [line]
            current_h2 = stripped[3:].strip()
            current_h3 = ""
            current_heading_text = current_h2
            current_anchor = heading_to_anchor(current_h2)
            continue

        # Check for H3
        if stripped.startswith("### "):
            commit_section()
            current_lines = [line]
            current_h3 = stripped[4:].strip()
            current_heading_text = current_h3
            current_anchor = heading_to_anchor(current_h3)
            continue

        current_lines.append(line)

    commit_section()
    return sections


def chunk_sections(sections: list[Section]) -> list[Chunk]:
    """Convert sections into embedding-ready chunks, respecting tables and token budgets."""
    chunks: list[Chunk] = []
    chunk_index = 0

    # Approx 4 characters per token
    max_chars = CHUNK_MAX_TOKENS * 4
    overlap_chars = CHUNK_OVERLAP_TOKENS * 4

    for sec in sections:
        content = sec.content.strip()

        # Special Rule: Never split markdown tables (e.g. Plan Comparison Table in pricing).
        # A delimiter row (e.g. |---------| or | :--- |) marks the section as a table.
        has_table = TABLE_SEPARATOR_RE.search(content) is not None

        if has_table or len(content) <= max_chars:
            chunks.append(
                Chunk(
                    page_slug=sec.page_slug,
                    page_title=sec.page_title,
                    page_url=sec.page_url,
                    heading_path=sec.heading_path,
                    anchor_id=sec.anchor_id,
                    chunk_index=chunk_index,
                    content=content,
                )
            )
            chunk_index += 1
            continue

        # Split long section into paragraphs/sentences with overlap
        paragraphs = content.split("\n\n")
        current_chunk_text = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk_text) + len(para) + 2 <= max_chars:
                if current_chunk_text:
                    current_chunk_text += "\n\n" + para
                else:
                    current_chunk_text = para
            else:
                if current_chunk_text:
                    chunks.append(
                        Chunk(
                            page_slug=sec.page_slug,
                            page_title=sec.page_title,
                            page_url=sec.page_url,
                            heading_path=sec.heading_path,
                            anchor_id=sec.anchor_id,
                            chunk_index=chunk_index,
                            content=current_chunk_text,
                        )
                    )
                    chunk_index += 1

                    # Compute overlap from previous text
                    tail = current_chunk_text[-overlap_chars:] if len(current_chunk_text) > overlap_chars else current_chunk_text
                    current_chunk_text = f"{tail}\n\n{para}" if tail else para
                else:
                    # Single paragraph exceeds max_chars: chunk by character slicing
                    for start in range(0, len(para), max_chars - overlap_chars):
                        slice_text = para[start : start + max_chars]
                        chunks.append(
                            Chunk(
                                page_slug=sec.page_slug,
                                page_title=sec.page_title,
                                page_url=sec.page_url,
                                heading_path=sec.heading_path,
                                anchor_id=sec.anchor_id,
                                chunk_index=chunk_index,
                                content=slice_text,
                            )
                        )
                        chunk_index += 1
                    current_chunk_text = ""

        if current_chunk_text:
            chunks.append(
                Chunk(
                    page_slug=sec.page_slug,
                    page_title=sec.page_title,
                    page_url=sec.page_url,
                    heading_path=sec.heading_path,
                    anchor_id=sec.anchor_id,
                    chunk_index=chunk_index,
                    content=current_chunk_text,
                )
            )
            chunk_index += 1

    return chunks


def find_all_markdown_files(content_dir: Path) -> list[Path]:
    """Find all markdown files under content directory."""
    files: list[Path] = []
    if not content_dir.exists():
        logger.error("Content directory does not exist: %s", content_dir)
        return files

    for path in sorted(content_dir.rglob("*.md")):
        if path.is_file():
            files.append(path)
    return files


def ingest_file(
    file_path: Path,
    content_root: Path,
    force: bool = False,
) -> tuple[int, bool, str | None]:
    """Ingest a single markdown file into the database.

    Returns:
        (chunk_count, was_skipped, error_message)
    """
    try:
        return _ingest_file_impl(file_path, content_root, force=force)
    except Exception as e:
        logger.exception("Unexpected error ingesting %s", file_path)
        return 0, False, f"Failed to ingest {file_path}: {e}"


def _ingest_file_impl(
    file_path: Path,
    content_root: Path,
    force: bool,
) -> tuple[int, bool, str | None]:
    """Read, chunk, embed, and store a single file, returning (chunk_count, skipped, error)."""
    try:
        raw_text = file_path.read_text(encoding="utf-8")
    except Exception as e:
        return 0, False, f"Failed to read {file_path}: {e}"

    content_hash = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()

    # Determine default slug from relative path
    rel_path = file_path.relative_to(content_root)
    # e.g. pages/pricing.md -> pricing; faq/faq.md -> faq; pages/resources/post.md -> resources/post
    rel_str = str(rel_path.with_suffix("")).replace("\\", "/")
    if rel_str.startswith("pages/"):
        default_slug = rel_str[len("pages/") :]
    elif rel_str.startswith("faq/"):
        default_slug = "faq"
    else:
        default_slug = rel_str

    parsed = parse_frontmatter(raw_text, default_slug=default_slug)
    slug = parsed.slug or default_slug
    title = parsed.title

    # Idempotency check: skip if hash unchanged and not force
    if not force:
        existing = get_page_by_slug(slug)
        if existing and existing.get("content_hash") == content_hash:
            logger.info("Skipping %s (hash unchanged: %s...)", slug, content_hash[:8])
            return 0, True, None

    logger.info("Processing %s ('%s')...", slug, title)

    # Parse and chunk
    sections = split_into_sections(slug, title, parsed.body)
    chunks = chunk_sections(sections)

    if not chunks:
        logger.warning("No chunks created for %s", slug)
        return 0, False, None

    # Embed chunks
    texts_to_embed = [
        f"{c.heading_path}\n{c.content}" if c.heading_path else c.content
        for c in chunks
    ]
    embeddings = embed_texts(texts_to_embed)

    if len(embeddings) != len(chunks):
        return 0, False, f"Embedding count mismatch for {slug}: got {len(embeddings)}, expected {len(chunks)}"

    chunks_with_embeddings = [
        ChunkWithEmbedding(chunk=chunk, embedding=emb)
        for chunk, emb in zip(chunks, embeddings, strict=True)
    ]

    # Store in DB
    page_id = upsert_page(
        slug=slug,
        title=title,
        content=raw_text,
        content_hash=content_hash,
        chunk_count=len(chunks),
    )
    delete_page_chunks(page_id)
    store_chunks(chunks_with_embeddings, page_id)

    logger.info("Successfully ingested %s: %d chunks", slug, len(chunks))
    return len(chunks), False, None


def ingest_all(
    content_dir: Path | None = None,
    target_file: Path | None = None,
    force: bool = False,
) -> IngestResult:
    """Run full or targeted ingestion of markdown content into pgvector."""
    content_root = (content_dir or CONTENT_DIR).resolve()
    init_db()

    result = IngestResult()

    if target_file:
        files = [target_file.resolve()]
    else:
        files = find_all_markdown_files(content_root)

    logger.info("Found %d markdown files in %s", len(files), content_root)

    for f in files:
        chunk_count, skipped, err = ingest_file(f, content_root, force=force)
        if err:
            result.errors.append(err)
            logger.error("Error ingesting %s: %s", f, err)
        elif skipped:
            result.pages_skipped += 1
        else:
            result.pages_processed += 1
            result.chunks_created += chunk_count

    return result


def main():
    """CLI entrypoint for ingestion."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    parser = argparse.ArgumentParser(description="Veracity RAG Content Ingestion CLI")
    parser.add_argument(
        "--file",
        type=Path,
        default=None,
        help="Ingest a specific markdown file only",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-ingestion even if content_hash matches",
    )
    args = parser.parse_args()

    logger.info("Starting ingestion...")
    res = ingest_all(target_file=args.file, force=args.force)
    logger.info(
        "Ingestion complete: %d pages processed, %d pages skipped, %d chunks created, %d errors",
        res.pages_processed,
        res.pages_skipped,
        res.chunks_created,
        len(res.errors),
    )


if __name__ == "__main__":
    main()
