"""PostgreSQL + pgvector database interface and repository methods."""

from __future__ import annotations

import json
import logging
from typing import Any

import psycopg2
from pgvector.psycopg2 import register_vector
from psycopg2.extras import RealDictCursor, execute_values

from config import DATABASE_URL, EMBEDDING_DIM
from schemas import ChunkWithEmbedding, Message, RetrievedChunk

logger = logging.getLogger(__name__)

WEB_CHUNKS_TABLE_SQL = """
    CREATE TABLE IF NOT EXISTS web_chunks (
        id SERIAL PRIMARY KEY,
        page_id INT REFERENCES web_pages(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        heading_path TEXT,
        anchor_id VARCHAR(255),
        page_url VARCHAR(512),
        embedding VECTOR({dim}),
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
"""


def get_connection():
    """Create a new PostgreSQL database connection and register pgvector if available."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        register_vector(conn)
    except psycopg2.ProgrammingError:
        # Vector extension not registered yet in DB (e.g. during initial setup)
        pass
    return conn


def _get_embedding_dim(cur) -> int | None:
    """Return the current dimension of web_chunks.embedding, or None if not vector-typed."""
    cur.execute(
        "SELECT atttypmod FROM pg_attribute "
        "WHERE attrelid = 'web_chunks'::regclass AND attname = 'embedding'"
    )
    row = cur.fetchone()
    return row[0] if row and row[0] != -1 else None


def init_db():
    """Initialize database tables, extensions, and schema (idempotent)."""
    conn = get_connection()
    cur = conn.cursor()

    # Enable pgvector extension
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Table for tracking ingested web pages & content hashes (FR-DATA-3)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS web_pages (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(255) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            content_hash VARCHAR(64),
            chunk_count INT DEFAULT 0,
            ingested_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Table for storing chunked markdown and vector embeddings
    cur.execute(WEB_CHUNKS_TABLE_SQL.format(dim=EMBEDDING_DIM))

    # Table for conversation history / sessions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS web_chat_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            messages JSONB NOT NULL DEFAULT '[]',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Commit base DDL before the optional index so a failed index cannot roll it back
    conn.commit()

    # Idempotent migrations for databases created by older schemas
    cur.execute("ALTER TABLE web_pages ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64)")
    cur.execute("ALTER TABLE web_chunks ADD COLUMN IF NOT EXISTS heading_path TEXT")
    cur.execute("ALTER TABLE web_chunks ADD COLUMN IF NOT EXISTS anchor_id VARCHAR(255)")
    cur.execute("ALTER TABLE web_chunks ADD COLUMN IF NOT EXISTS page_url VARCHAR(512)")

    # Recreate web_chunks if its embedding dimension no longer matches the model,
    # then clear content hashes so the next ingestion run re-embeds everything.
    current_dim = _get_embedding_dim(cur)
    if current_dim is not None and current_dim != EMBEDDING_DIM:
        logger.warning(
            "web_chunks.embedding is VECTOR(%d) but EMBEDDING_DIM=%d; dropping the table and "
            "clearing content hashes so all pages are re-ingested at the new dimension.",
            current_dim,
            EMBEDDING_DIM,
        )
        cur.execute("DROP TABLE IF EXISTS web_chunks")
        cur.execute(WEB_CHUNKS_TABLE_SQL.format(dim=EMBEDDING_DIM))
        cur.execute("UPDATE web_pages SET content_hash = NULL")
    conn.commit()

    # HNSW index for fast approximate nearest neighbor search.
    # pgvector's HNSW supports at most 2000 dimensions, so skip the attempt (and
    # the eventual silent rollback) when the configured dimension exceeds that.
    if EMBEDDING_DIM <= 2000:
        try:
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
                ON web_chunks USING hnsw (embedding vector_cosine_ops)
            """)
            conn.commit()
        except Exception as e:
            # HNSW unsupported on older pgvector (< 0.5.0) or opclass/permission
            # errors: fall back to exact search. Only the failed index is rolled
            # back; tables and migrations are already committed.
            logger.warning(
                "Could not create HNSW index; falling back to exact search: %s", e
            )
            conn.rollback()
            cur = conn.cursor()
    else:
        logger.info(
            "Skipping HNSW index: embedding dimension %d exceeds pgvector's 2000-dim HNSW limit; using exact search.",
            EMBEDDING_DIM,
        )

    cur.close()
    conn.close()


def get_page_by_slug(slug: str) -> dict[str, Any] | None:
    """Retrieve a page record by its slug."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        "SELECT id, slug, title, content_hash, chunk_count, ingested_at FROM web_pages WHERE slug = %s",
        (slug,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def upsert_page(
    slug: str,
    title: str,
    content: str,
    content_hash: str,
    chunk_count: int,
) -> int:
    """Insert or update a web_page record and return its page_id."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO web_pages (slug, title, content, content_hash, chunk_count, ingested_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            content_hash = EXCLUDED.content_hash,
            chunk_count = EXCLUDED.chunk_count,
            ingested_at = NOW()
        RETURNING id
        """,
        (slug, title, content, content_hash, chunk_count),
    )
    page_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return page_id


def delete_page_chunks(page_id: int) -> None:
    """Delete existing chunks for a given page before re-ingestion."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM web_chunks WHERE page_id = %s", (page_id,))
    conn.commit()
    cur.close()
    conn.close()


def store_chunks(chunks: list[ChunkWithEmbedding], page_id: int) -> None:
    """Batch store chunks and embeddings into web_chunks."""
    if not chunks:
        return

    conn = get_connection()
    cur = conn.cursor()

    data = [
        (
            page_id,
            item.chunk.chunk_index,
            item.chunk.content,
            item.chunk.heading_path,
            item.chunk.anchor_id,
            item.chunk.page_url,
            item.embedding,
        )
        for item in chunks
    ]

    execute_values(
        cur,
        """
        INSERT INTO web_chunks (page_id, chunk_index, content, heading_path, anchor_id, page_url, embedding)
        VALUES %s
        """,
        data,
        template="(%s, %s, %s, %s, %s, %s, %s::vector)",
    )
    conn.commit()
    cur.close()
    conn.close()


def search_similar_chunks(
    query_embedding: list[float],
    top_k: int = 8,
) -> list[RetrievedChunk]:
    """Perform cosine distance similarity search in web_chunks.

    Cosine similarity = 1 - (embedding <=> query_vector).
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT
            c.content,
            c.page_url,
            c.heading_path,
            c.anchor_id,
            p.title AS page_title,
            1 - (c.embedding <=> %s::vector) AS similarity
        FROM web_chunks c
        JOIN web_pages p ON c.page_id = p.id
        ORDER BY c.embedding <=> %s::vector
        LIMIT %s
    """
    cur.execute(query, (query_embedding, query_embedding, top_k))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    results: list[RetrievedChunk] = []
    for r in rows:
        results.append(
            RetrievedChunk(
                content=r["content"],
                page_url=r["page_url"] or "",
                heading_path=r["heading_path"] or "",
                anchor_id=r["anchor_id"] or "",
                page_title=r["page_title"] or "",
                similarity=float(r["similarity"]) if r["similarity"] is not None else 0.0,
            )
        )
    return results


def get_session_history(session_id: str, limit: int = 6) -> list[Message]:
    """Retrieve message history for a given session UUID."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "SELECT messages FROM web_chat_sessions WHERE id = %s::uuid",
            (session_id,),
        )
        row = cur.fetchone()
    except Exception:
        # Invalid UUID or DB error
        conn.rollback()
        cur.close()
        conn.close()
        return []

    cur.close()
    conn.close()

    if not row or not row["messages"]:
        return []

    raw_msgs = row["messages"]
    if isinstance(raw_msgs, str):
        raw_msgs = json.loads(raw_msgs)

    # Take the most recent messages up to limit
    trimmed = raw_msgs[-limit:] if len(raw_msgs) > limit else raw_msgs
    return [Message(role=m["role"], content=m["content"]) for m in trimmed]


def append_to_session(
    session_id: str | None,
    user_message: str,
    assistant_message: str,
) -> str:
    """Append a user & assistant exchange to the session, creating a new session if needed."""
    conn = get_connection()
    cur = conn.cursor()

    if not session_id:
        # Create a new session
        messages = [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_message},
        ]
        cur.execute(
            """
            INSERT INTO web_chat_sessions (messages, updated_at)
            VALUES (%s::jsonb, NOW())
            RETURNING id
            """,
            (json.dumps(messages),),
        )
        new_id = str(cur.fetchone()[0])
        conn.commit()
        cur.close()
        conn.close()
        return new_id

    # Existing session: fetch and append
    try:
        cur.execute(
            "SELECT messages FROM web_chat_sessions WHERE id = %s::uuid",
            (session_id,),
        )
        row = cur.fetchone()
        if row:
            raw_msgs = row[0]
            if isinstance(raw_msgs, str):
                raw_msgs = json.loads(raw_msgs)
            raw_msgs.append({"role": "user", "content": user_message})
            raw_msgs.append({"role": "assistant", "content": assistant_message})
            cur.execute(
                """
                UPDATE web_chat_sessions
                SET messages = %s::jsonb, updated_at = NOW()
                WHERE id = %s::uuid
                """,
                (json.dumps(raw_msgs), session_id),
            )
            conn.commit()
            cur.close()
            conn.close()
            return session_id
        else:
            # Session ID was passed but not found in DB: create with that UUID or new
            messages = [
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": assistant_message},
            ]
            cur.execute(
                """
                INSERT INTO web_chat_sessions (id, messages, updated_at)
                VALUES (%s::uuid, %s::jsonb, NOW())
                ON CONFLICT (id) DO UPDATE SET messages = EXCLUDED.messages, updated_at = NOW()
                RETURNING id
                """,
                (session_id, json.dumps(messages)),
            )
            created_id = str(cur.fetchone()[0])
            conn.commit()
            cur.close()
            conn.close()
            return created_id
    except Exception:
        conn.rollback()
        # Fallback: create fresh session
        messages = [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_message},
        ]
        cur.execute(
            """
            INSERT INTO web_chat_sessions (messages, updated_at)
            VALUES (%s::jsonb, NOW())
            RETURNING id
            """,
            (json.dumps(messages),),
        )
        new_id = str(cur.fetchone()[0])
        conn.commit()
        cur.close()
        conn.close()
        return new_id
