"""FastAPI application entrypoint for the Veracity RAG assistant."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from database import init_db
from rag import stream_rag_response
from schemas import ChatRequest, HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("veracity_backend")


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


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """Chat endpoint supporting SSE streaming."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    generator = stream_rag_response(
        query=req.message.strip(),
        session_id=req.session_id,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
