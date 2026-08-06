"""Pydantic models and typed data classes for the Veracity RAG backend."""

from __future__ import annotations

from dataclasses import dataclass, field

from pydantic import BaseModel

# ---------------------------------------------------------------------------
# API request / response
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Incoming chat request from the frontend proxy or eval harness."""

    message: str
    session_id: str | None = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"


class SourceItem(BaseModel):
    """Source item in citations list."""

    title: str
    url: str


# ---------------------------------------------------------------------------
# Content & chunking
# ---------------------------------------------------------------------------

@dataclass
class Section:
    """A heading-delimited section extracted from a markdown file."""

    page_slug: str
    page_title: str
    heading_path: str  # e.g. "Privacy and Data > How is data encrypted?"
    heading_text: str  # the immediate heading text
    anchor_id: str  # e.g. "how-is-data-encrypted"
    content: str  # full text of the section including the heading line
    page_url: str  # e.g. "/faq"


@dataclass
class Chunk:
    """A chunk ready for embedding, derived from one or more Sections."""

    page_slug: str
    page_title: str
    page_url: str
    heading_path: str
    anchor_id: str
    chunk_index: int
    content: str


@dataclass
class ChunkWithEmbedding:
    """A Chunk with its embedding vector attached."""

    chunk: Chunk
    embedding: list[float]


@dataclass
class IngestResult:
    """Summary of an ingestion run."""

    pages_processed: int = 0
    pages_skipped: int = 0
    chunks_created: int = 0
    errors: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

@dataclass
class RetrievedChunk:
    """A chunk returned by similarity search, with its score."""

    content: str
    page_url: str
    heading_path: str
    anchor_id: str
    page_title: str
    similarity: float  # cosine similarity score (higher = more similar)

    @property
    def citation_url(self) -> str:
        """Build the citation deep-link URL."""
        if self.anchor_id:
            return f"{self.page_url}#{self.anchor_id}"
        return self.page_url


# ---------------------------------------------------------------------------
# Session / history
# ---------------------------------------------------------------------------

@dataclass
class Message:
    """A single message in a conversation session."""

    role: str  # "user" or "assistant"
    content: str
