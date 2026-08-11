"""RAG pipeline: retrieval, prompt construction, LLM streaming, and session history."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from collections.abc import AsyncGenerator

from citation import build_citation_url
from config import RETRIEVAL_TOP_K, SIMILARITY_THRESHOLD
from database import (
    append_to_session,
    get_session_history,
    search_similar_chunks,
)
from embeddings import embed_text
from llm import ModelUnavailable, ProviderError, build_provider_chain, current_usage
from metrics import metrics
from observability import current_metrics
from prompts import build_messages_payload
from schemas import RetrievedChunk, SourceItem

logger = logging.getLogger(__name__)

MAX_CITATIONS = 3

metrics.register("retrieval_count_total", "counter", "Total context chunks retrieved across all requests.")
metrics.register("retrieval_ms", "histogram", "Time spent embedding the query and fetching chunks, ms.")
metrics.register("provider_requests_total", "counter", "LLM provider stream_chat calls by provider/model/status.")
metrics.register("provider_rotations_total", "counter", "Times the pipeline fell through to the next model after a 429/5xx.")
metrics.register("provider_call_ms", "histogram", "Latency of one provider stream_chat call (full stream), ms.")

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
    start = time.monotonic()
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

    # Record how long retrieval took and how many chunks we landed on. This is
    # the "how fast is the context step?" number that shows up in /metrics as
    # `retrieval_ms_bucket{le="..."}`, and on the request summary log line.
    elapsed_ms = (time.monotonic() - start) * 1000
    current_metrics().retrieval_ms = elapsed_ms
    current_metrics().retrieval_count = len(filtered)
    metrics.inc("retrieval_count_total", value=len(filtered))
    metrics.observe("retrieval_ms", elapsed_ms)
    return filtered


def extract_sources(chunks: list[RetrievedChunk]) -> list[SourceItem]:
    """Deduplicate, rank by similarity, and cap citation sources."""
    seen_urls: set[str] = set()
    sources: list[SourceItem] = []

    for c in sorted(chunks, key=lambda c: c.similarity, reverse=True):
        url = build_citation_url(c.page_url, c.anchor_id)
        if url in seen_urls:
            continue
        seen_urls.add(url)
        title = f"{c.page_title} — {c.heading_path}" if c.heading_path else c.page_title
        sources.append(SourceItem(title=title, url=url, similarity=c.similarity))
        if len(sources) >= MAX_CITATIONS:
            break

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

        # 5. Stream completion from the provider chain, rotating through
        #    providers/models when one is unavailable (402/429/5xx).
        full_content: list[str] = []
        last_unavailable_status: int | None = None
        completed = False
        stream_start = time.monotonic()

        for provider, model in build_provider_chain():
            provider_start = time.monotonic()
            first_token = True
            try:
                async for token in provider.stream_chat(messages, model=model):
                    # Record the time-to-first-token on the very first yielded
                    # token — the NFR that gates eval runs (p95 < 5s). The
                    # request summary log + /metrics capture it via ContextVar.
                    if first_token:
                        first_token = False
                        current_metrics().first_token_ms = (time.monotonic() - stream_start) * 1000
                        current_metrics().provider_used = provider.name
                        current_metrics().model_used = model
                    full_content.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                completed = True
                metrics.inc(
                    "provider_requests_total",
                    {"provider": provider.name, "model": model, "status": "200"},
                )
                metrics.observe(
                    "provider_call_ms",
                    (time.monotonic() - provider_start) * 1000,
                    {"provider": provider.name, "model": model},
                )
                # Tokens consumed by this provider call (captured from the
                # streamed usage metadata by llm.py) ride along on the request.
                usage = current_usage()
                logger.info(
                    "provider_call_completed",
                    extra={
                        "provider": provider.name,
                        "model": model,
                        "stream_ms": round((time.monotonic() - provider_start) * 1000, 1),
                        "prompt_tokens": usage.prompt_tokens,
                        "completion_tokens": usage.completion_tokens,
                    },
                )
                break
            except ModelUnavailable as e:
                metrics.inc(
                    "provider_requests_total",
                    {"provider": provider.name, "model": model, "status": str(e.status)},
                )
                metrics.inc("provider_rotations_total")
                current_metrics().rotation_count += 1
                logger.warning(
                    "provider_unavailable",
                    extra={
                        "provider": provider.name,
                        "model": model,
                        "status": e.status,
                        "detail": getattr(e, "detail", None),
                    },
                )
                last_unavailable_status = e.status
                continue
            except ProviderError as e:
                # Terminal (non-retryable) provider failure.
                metrics.inc(
                    "provider_requests_total",
                    {"provider": provider.name, "model": model, "status": "error"},
                )
                logger.error(
                    "provider_error_terminal",
                    extra={"provider": provider.name, "model": model, "error": repr(e)},
                )
                # This request ends here with an error SSE event rather than a
                # raised exception (the stream completes), so the endpoint layer
                # can't see it — count it explicitly or it never reaches the
                # error metric.
                metrics.inc("chat_errors_total")
                yield (
                    "data: "
                    + json.dumps({"type": "error", "message": f"Upstream error: {e}"})
                    + "\n\n"
                )
                return

        if not completed:
            logger.error(
                "providers_exhausted",
                extra={"last_status": last_unavailable_status, "query": query},
            )
            metrics.inc("chat_errors_total")
            yield (
                "data: "
                + json.dumps(
                    {
                        "type": "error",
                        "message": f"Upstream error: {last_unavailable_status or 429}",
                    }
                )
                + "\n\n"
            )
            return

        # 7. Send citations event after the answer so the client shows them under text
        if sources:
            sources_dict = [{"title": s.title, "url": s.url} for s in sources]
            yield f"data: {json.dumps({'type': 'citations', 'sources': sources_dict})}\n\n"

        # 8. Persist interaction to session in database
        assistant_text = "".join(full_content)
        current_metrics().char_count = len(assistant_text)
        if assistant_text.strip():
            saved_session_id = await asyncio.to_thread(
                append_to_session,
                session_id=session_id,
                user_message=query,
                assistant_message=assistant_text,
            )

            # 9. Send session event
            yield f"data: {json.dumps({'type': 'session', 'session_id': saved_session_id})}\n\n"

        # 10. Send done event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        logger.exception("Error in stream_rag_response: %s", e)
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

