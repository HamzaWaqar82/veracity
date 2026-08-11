"""FastAPI application entrypoint for the Veracity RAG assistant."""

from __future__ import annotations

import logging
import sys
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from database import init_db
from metrics import metrics
from observability import (
    current_metrics,
    new_request_id,
    set_request_id,
    setup_logging,
)
from rag import stream_rag_response
from schemas import ChatRequest, HealthResponse

setup_logging()
logger = logging.getLogger("veracity_backend")

# Metrics we emit from this module (the endpoint layer). Registering here also
# makes them appear in GET /metrics even before the first request.
metrics.register("chat_requests_total", "counter", "Total chat requests completed (200 or error).")
metrics.register("chat_errors_total", "counter", "Chat requests that raised an unhandled error.")
metrics.register("chat_disconnects_total", "counter", "Chat requests the client abandoned mid-stream.")
metrics.register("chat_total_ms", "histogram", "End-to-end latency of a chat request, ms.")
metrics.register("chat_first_token_ms", "histogram", "Time to first streamed token, ms.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables and schema on startup."""
    logger.info("Initializing database schema...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error("Failed to initialize database: %s", e)
    yield


app = FastAPI(
    title="Veracity Assistant API",
    description="Content-grounded RAG assistant for the Veracity marketing website.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for local frontend development and production.
# The chat API is unauthenticated and passes the session id in the request body
# (no cookies), so credentials are disabled to keep the wildcard origin valid.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for liveness probes."""
    return HealthResponse(status="ok")


@app.get("/metrics")
async def metrics_endpoint():
    """Expose counters/histograms in Prometheus text format.

    Plain text, greppable with curl/grep today, and scrapable by a real
    Prometheus server later without any rework.
    """
    return Response(content=metrics.render(), media_type="text/plain; version=0.0.4")


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """Chat endpoint supporting SSE streaming.

    Each request gets a request_id that is stamped onto every log line the
    pipeline emits (retrieval, provider calls, first token) and returned as the
    X-Request-Id header, so a single bot answer can be traced end-to-end.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Begin a new per-request context: id + metrics accumulator.
    request_id = new_request_id()
    set_request_id(request_id)
    ctx = current_metrics()
    ctx.request_id = request_id
    ctx.started_at = time.monotonic()

    query = req.message.strip()
    logger.info(
        "chat_request_started",
        extra={"session_id": req.session_id, "query_length": len(query)},
    )

    generator = stream_rag_response(query=query, session_id=req.session_id)

    async def sse_wrapper():
        """Wrap the SSE generator so completion is logged after the stream ends."""
        try:
            async for chunk in generator:
                yield chunk
        except Exception as exc:
            ctx.error = repr(exc)
            metrics.inc("chat_errors_total")
            logger.exception("chat_request_failed")
            raise
        finally:
            ctx.total_ms = (time.monotonic() - ctx.started_at) * 1000
            if sys.exc_info()[0] is GeneratorExit:
                # The client closed the connection mid-stream (GeneratorExit is
                # thrown into the generator, and being a BaseException it skips
                # the `except Exception` above). Don't count it as a completed
                # request or record its latency — a handful of abandoned tabs
                # would otherwise inflate chat_total_ms and hide real p95.
                metrics.inc("chat_disconnects_total")
                logger.info(
                    "chat_request_disconnected",
                    extra={"total_ms": round(ctx.total_ms, 1)},
                )
            else:
                metrics.inc("chat_requests_total")
                metrics.observe("chat_total_ms", ctx.total_ms)
                if ctx.first_token_ms:
                    metrics.observe("chat_first_token_ms", ctx.first_token_ms)
                # One summary line per request — the single place to look for
                # everything that happened on the way to an answer.
                logger.info(
                    "chat_request_completed",
                    extra={
                        "session_id": req.session_id,
                        "total_ms": round(ctx.total_ms, 1),
                        "first_token_ms": round(ctx.first_token_ms, 1),
                        "retrieval_count": ctx.retrieval_count,
                        "retrieval_ms": round(ctx.retrieval_ms, 1),
                        "provider": ctx.provider_used,
                        "error": ctx.error,
                    },
                )

    return StreamingResponse(
        sse_wrapper(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "X-Request-Id": request_id,
        },
    )
