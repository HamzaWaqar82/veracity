"""FastAPI application entrypoint for the Veracity RAG assistant."""

from __future__ import annotations

import logging
import re
import sys
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, StreamingResponse

from config import ALLOWED_ORIGINS, INTERNAL_TOKEN
from database import init_db, store_lead
from metrics import metrics
from observability import (
    current_metrics,
    new_request_id,
    set_request_id,
    setup_logging,
)
from rag import stream_rag_response
from schemas import ChatRequest, HealthResponse, LeadRequest

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

# CORS: only the frontend origin(s) may call the API. A bare "*" is rejected
# at startup — production must list explicit origins via ALLOWED_ORIGINS.
if not ALLOWED_ORIGINS:
    # Allow local dev convenience without weakening prod: if no origins are
    # configured, fall back to open only when no internal token is set (local).
    _cors_origins = ["*"] if not INTERNAL_TOKEN else []
    if not _cors_origins:
        logger.warning(
            "ALLOWED_ORIGINS is empty and VERACITY_INTERNAL_TOKEN is set; "
            "CORS will reject all browser cross-origin requests. Set ALLOWED_ORIGINS."
        )
else:
    _cors_origins = ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Token"],
)

# Routes that must only be reachable via the trusted Next.js server proxy.
# The proxy forwards VERACITY_INTERNAL_TOKEN as the X-Internal-Token header;
# any other caller (including a browser or rogue client) is rejected with 401,
# which prevents anonymous quota-burn against the paid LLM providers.
_PROTECTED_PREFIXES = ("/api/chat", "/api/lead")


@app.middleware("http")
async def require_internal_token(request: Request, call_next):
    if request.url.path.startswith(_PROTECTED_PREFIXES):
        expected = INTERNAL_TOKEN
        if not expected:
            logger.error(
                "Refusing proxied request to %s: VERACITY_INTERNAL_TOKEN is not set.",
                request.url.path,
            )
            return JSONResponse(
                status_code=503,
                content={"error": "Backend is not configured for proxied requests."},
            )
        if request.headers.get("X-Internal-Token") != expected:
            logger.warning("Rejected unauthorized call to %s", request.url.path)
            return JSONResponse(status_code=401, content={"error": "Unauthorized."})
    return await call_next(request)


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


_LEAD_KINDS = {"contact", "demo", "trial"}
_EMAIL_RE = re.compile(r"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")


@app.post("/api/lead")
async def lead_endpoint(req: LeadRequest):
    """Persist a marketing-form lead.

    Protected by the X-Internal-Token middleware (only the Next.js server proxy
    may call this). Validation here is authoritative so leads are never lost to
    a silent 500 even if a future client skips frontend checks.
    """
    kind = (req.kind or "").strip()
    name = (req.name or "").strip()
    email = (req.email or "").strip()
    if kind not in _LEAD_KINDS:
        raise HTTPException(status_code=400, detail="Unknown form type.")
    if not name or not _EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Name and a valid email are required.")

    lead_id = store_lead(req.normalized())
    return JSONResponse(status_code=201, content={"ok": True, "id": lead_id})

