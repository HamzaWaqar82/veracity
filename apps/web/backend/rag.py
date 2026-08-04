"""RAG pipeline: retrieval, prompt construction, LLM streaming, and session history."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from collections.abc import AsyncGenerator

import httpx

from citation import build_citation_url
from config import (
    LLM_MODEL,
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    RETRIEVAL_TOP_K,
    SIMILARITY_THRESHOLD,
)
from database import (
    append_to_session,
    get_session_history,
    search_similar_chunks,
)
from embeddings import embed_text
from prompts import build_messages_payload
from schemas import RetrievedChunk, SourceItem

logger = logging.getLogger(__name__)

PRICING_PHRASE_KEYWORDS = {
    "how much",
    "free trial",
    "per user",
    "per seat",
    "14-day",
}

PRICING_WORD_KEYWORDS = {
    "price",
    "pricing",
    "cost",
    "tier",
    "tiers",
    "starter",
    "growth",
    "enterprise",
    "plans",
    "monthly",
    "billed",
    "billing",
    "discount",
    "trial",
    "subscription",
}


def is_pricing_query(query: str) -> bool:
    """Check if the user query is asking about pricing or plan tiers."""
    lower = query.lower()
    words = re.findall(r"\b\w+(?:-\w+)?\b", lower)
    if any(kw in lower for kw in PRICING_PHRASE_KEYWORDS):
        return True
    return any(word in PRICING_WORD_KEYWORDS for word in words)


async def retrieve_context(query: str) -> list[RetrievedChunk]:
    """Retrieve relevant context chunks for a query using pgvector."""
    # Generate embedding for the query
    try:
        query_vector = await asyncio.to_thread(embed_text, query)
    except Exception as e:
        logger.error("Failed to generate query embedding: %s", e)
        return []

    # Search top K chunks in database
    chunks = await asyncio.to_thread(
        search_similar_chunks, query_vector, top_k=RETRIEVAL_TOP_K
    )

    # Filter by similarity threshold if available
    filtered = [c for c in chunks if c.similarity >= SIMILARITY_THRESHOLD]
    if not filtered and chunks:
        # If all below threshold, keep the top 2 as fallback for the LLM to inspect
        filtered = chunks[:2]

    # If pricing query, ensure /pricing chunks are prioritised
    if is_pricing_query(query):
        pricing_chunks = [
            c
            for c in chunks
            if "/pricing" in c.page_url and c.similarity >= SIMILARITY_THRESHOLD
        ]
        if pricing_chunks:
            # Place pricing chunks at the top, keeping the context within top_k
            non_pricing = [c for c in filtered if "/pricing" not in c.page_url]
            filtered = (pricing_chunks + non_pricing)[:RETRIEVAL_TOP_K]

    return filtered


def extract_sources(chunks: list[RetrievedChunk]) -> list[SourceItem]:
    """Deduplicate and extract citation sources from retrieved chunks."""
    seen_urls: set[str] = set()
    sources: list[SourceItem] = []

    for c in chunks:
        url = build_citation_url(c.page_url, c.anchor_id)
        if url not in seen_urls:
            seen_urls.add(url)
            title = f"{c.page_title} — {c.heading_path}" if c.heading_path else c.page_title
            sources.append(SourceItem(title=title, url=url))

    return sources


async def stream_rag_response(
    query: str,
    session_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """Execute the full RAG pipeline and yield SSE data lines.

    SSE Line format: "data: {json}\n\n"
    Event types:
      - {"type": "token", "content": "..."}
      - {"type": "citations", "sources": [...]}
      - {"type": "session", "session_id": "..."}
      - {"type": "done"}
      - {"type": "error", "message": "..."}
    """
    try:
        # 1. Retrieve session history if session_id provided
        history = (
            await asyncio.to_thread(get_session_history, session_id)
            if session_id
            else []
        )

        # 2. Retrieve relevant chunks
        chunks = await retrieve_context(query)
        is_pricing = is_pricing_query(query)

        # 3. Extract citation sources
        sources = extract_sources(chunks)

        # 4. Construct prompt messages
        messages = build_messages_payload(
            query=query,
            context_chunks=chunks,
            history=history,
            is_pricing=is_pricing,
        )

        # 5. Send citations event early so the client can display them
        if sources:
            sources_dict = [{"title": s.title, "url": s.url} for s in sources]
            yield f"data: {json.dumps({'type': 'citations', 'sources': sources_dict})}\n\n"

        # 6. Stream completion from OpenRouter
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://veracity.dev",
            "X-Title": "Veracity Assistant",
        }
        payload = {
            "model": LLM_MODEL,
            "messages": messages,
            "stream": True,
            "temperature": 0.0,
        }

        full_content: list[str] = []

        async with (
            httpx.AsyncClient(timeout=60.0) as client,
            client.stream(
                "POST",
                f"{OPENROUTER_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            ) as resp,
        ):
            if resp.status_code != 200:
                err_body = await resp.aread()
                logger.error("OpenRouter API error [%d]: %s", resp.status_code, err_body.decode())
                yield f"data: {json.dumps({'type': 'error', 'message': f'Upstream error: {resp.status_code}'})}\n\n"
                return

            async for line in resp.aiter_lines():
                line = line.strip()
                if not line:
                    continue
                if line == "data: [DONE]":
                    break
                if not line.startswith("data: "):
                    continue

                raw_json = line[6:]
                try:
                    chunk_json = json.loads(raw_json)
                    choices = chunk_json.get("choices", [])
                    if not choices:
                        continue
                    delta = choices[0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        full_content.append(content)
                        yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
                except json.JSONDecodeError:
                    continue

        # 7. Persist interaction to session in database
        assistant_text = "".join(full_content)
        if assistant_text.strip():
            saved_session_id = await asyncio.to_thread(
                append_to_session,
                session_id=session_id,
                user_message=query,
                assistant_message=assistant_text,
            )

            # 8. Send session event
            yield f"data: {json.dumps({'type': 'session', 'session_id': saved_session_id})}\n\n"

        # 9. Send done event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        logger.exception("Error in stream_rag_response: %s", e)
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

