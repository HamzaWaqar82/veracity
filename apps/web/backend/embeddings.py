"""Embeddings generation using OpenRouter / OpenAIEmbeddings."""

from __future__ import annotations

import logging
import time
from collections.abc import Sequence

import httpx
from langchain_openai import OpenAIEmbeddings

from config import (
    EMBEDDING_DIM,
    EMBEDDING_MODEL,
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
)

logger = logging.getLogger(__name__)


def get_embeddings_client() -> OpenAIEmbeddings:
    """Create a LangChain OpenAIEmbeddings client configured for OpenRouter."""
    return OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        check_embedding_ctx_length=False,
        model_kwargs={"encoding_format": "float"},
    )


def _match_dimension(vector: list[float]) -> list[float]:
    """Truncate or reject an embedding vector that doesn't match EMBEDDING_DIM."""
    if len(vector) == EMBEDDING_DIM:
        return vector
    if len(vector) > EMBEDDING_DIM:
        return vector[:EMBEDDING_DIM]
    raise ValueError(
        f"Embedding dimension {len(vector)} is smaller than configured EMBEDDING_DIM={EMBEDDING_DIM}; "
        "update EMBEDDING_DIM in .env to match the model output."
    )


def embed_text(text: str, retries: int = 3) -> list[float]:
    """Generate an embedding vector for a single text query with retry logic."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not set in environment or .env file.")

    client = get_embeddings_client()
    for attempt in range(retries):
        try:
            vector = client.embed_query(text)
            return _match_dimension(vector)
        except Exception as e:
            logger.warning(
                "Embedding error on attempt %d/%d: %s. Retrying in %d seconds...",
                attempt + 1,
                retries,
                e,
                (attempt + 1) * 2,
            )
            if attempt == retries - 1:
                # Direct httpx fallback if LangChain wrapper encountered issues
                try:
                    return _embed_text_direct(text)
                except Exception as direct_err:
                    raise RuntimeError(f"Failed to generate embedding: {e}") from direct_err
            time.sleep((attempt + 1) * 2)

    raise RuntimeError("Failed to generate embedding after retries.")


def _embed_text_direct(text: str) -> list[float]:
    """Direct HTTP fallback to OpenRouter embeddings endpoint."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": EMBEDDING_MODEL,
        "input": text,
    }
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(f"{OPENROUTER_BASE_URL}/embeddings", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        vector = data["data"][0]["embedding"]
        return _match_dimension(vector)


def embed_texts(
    texts: Sequence[str],
    batch_size: int = 5,
    delay: float = 1.0,
    retries: int = 3,
) -> list[list[float]]:
    """Generate embeddings for a list of texts in batches with rate-limit throttling."""
    if not texts:
        return []

    client = get_embeddings_client()
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = list(texts[i : i + batch_size])
        batch_vectors: list[list[float]] | None = None

        for attempt in range(retries):
            try:
                batch_vectors = client.embed_documents(batch)
                break
            except Exception as e:
                logger.warning(
                    "Batch embedding error [%d:%d] on attempt %d/%d: %s",
                    i,
                    i + len(batch),
                    attempt + 1,
                    retries,
                    e,
                )
                if attempt == retries - 1:
                    # Try embedding items individually as fallback
                    individual_vectors: list[list[float]] = []
                    for t in batch:
                        time.sleep(delay)
                        individual_vectors.append(embed_text(t))
                    batch_vectors = individual_vectors
                else:
                    time.sleep((attempt + 1) * 2)

        if batch_vectors:
            for vec in batch_vectors:
                all_embeddings.append(_match_dimension(vec))

        # Small delay between batches to respect rate limits (20 req/min)
        if i + batch_size < len(texts):
            time.sleep(delay)

    return all_embeddings
