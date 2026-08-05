"""Configuration settings for the Veracity RAG backend."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from backend/.env or workspace root .env if present
load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/veracity")

# OpenRouter API Key & URLs
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY", "")

# Models
# Free embedding model on OpenRouter (2048-dim)
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3-embed-1b:free")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "2048"))

# LLM on OpenRouter
# nvidia/nemotron-3-ultra-550b-a55b:free (free tier, frequently 429-exhausted)
# openai/gpt-4o-mini (reliable on the current key)
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")


# Paths
BACKEND_DIR = Path(__file__).resolve().parent
CONTENT_DIR = Path(os.getenv("CONTENT_DIR", str(BACKEND_DIR.parent / "content"))).resolve()

# Retrieval & Chunking Tunables
RETRIEVAL_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "8"))
CHUNK_MAX_TOKENS = int(os.getenv("CHUNK_MAX_TOKENS", "800"))
CHUNK_OVERLAP_TOKENS = int(os.getenv("CHUNK_OVERLAP_TOKENS", "100"))
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.25"))

# Refusal and Routing
REFUSAL_CONTACT_URL = "/contact-us"
REFUSAL_CONTACT_EMAIL = "sales@veracity.dev"
