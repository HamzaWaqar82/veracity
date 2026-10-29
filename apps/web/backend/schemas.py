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


class LeadRequest(BaseModel):
    """Inbound lead from a marketing form, proxied by the frontend /api/lead route.

    Field rules mirror the frontend's LeadBody validation so the backend is the
    single source of truth for what a valid lead looks like (the frontend still
    validates first for fast UX, but the backend enforces it too).
    """

    kind: str
    name: str
    email: str
    company: str | None = None
    companySize: str | None = None
    coverage: str | None = None
    preferredTime: str | None = None
    topic: str | None = None
    message: str | None = None
    notes: str | None = None

    def normalized(self) -> dict[str, object]:
        """Return a trimmed, length-capped dict ready for storage."""
        cap = lambda v, n: (v.strip()[:n] if isinstance(v, str) else None)
        return {
            "kind": self.kind,
            "name": cap(self.name, 200),
            "email": cap(self.email, 254).lower() if self.email else "",
            "company": cap(self.company, 200),
            "company_size": cap(self.companySize, 50),
            "coverage": cap(self.coverage, 200),
            "preferred_time": cap(self.preferredTime, 200),
            "topic": cap(self.topic, 100),
            "message": cap(self.message, 2000),
            "notes": cap(self.notes, 2000),
        }


class SourceItem(BaseModel):
    """Source item in citations list."""

    title: str
    url: str
    similarity: float | None = None


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
