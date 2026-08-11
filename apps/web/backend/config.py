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

# Google Gemini API (hosted free tier) — used when LLM_PROVIDERS includes "gemini".
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
GEMINI_MODELS = [
    m.strip()
    for m in os.getenv("GEMINI_MODELS", "gemini-3.5-flash-lite").split(",")
    if m.strip()
]

# Models
# Free embedding model on OpenRouter (2048-dim)
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3-embed-1b:free")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "2048"))

# Free LLM chain on OpenRouter (fallback order — first is the primary).
# Free models are frequently rate-limited/exhausted (429/402) and routinely
# yanked from the free tier (404 -> paid only), so the backend transparently
# rotates to the next model when one is unavailable. Verified against
# OpenRouter's live /models list; re-check availability if scores dip.
DEFAULT_FREE_LLM_MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "openai/gpt-oss-20b:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
]

# Chain order overrides (preserve order, dedupe):
#   LLM_MODEL   -> single model used as the primary (rest of the chain follows)
#   LLM_MODELS  -> comma-separated list replaces the entire chain
_llm_model_env = os.getenv("LLM_MODEL", "").strip()
_llm_models_env = [m.strip() for m in os.getenv("LLM_MODELS", "").split(",") if m.strip()]
if _llm_models_env:
    LLM_MODELS = list(dict.fromkeys(_llm_models_env))
elif _llm_model_env:
    LLM_MODELS = list(dict.fromkeys([_llm_model_env, *DEFAULT_FREE_LLM_MODELS]))
else:
    LLM_MODELS = list(DEFAULT_FREE_LLM_MODELS)

# Backward-compatible primary model (first in the chain).
LLM_MODEL = LLM_MODELS[0]

# Ordered list of LLM providers to try for chat completions, comma-separated.
# The pipeline rotates through each provider's model chain in this order.
#   LLM_PROVIDERS=gemini,openrouter  -> Gemini first, OpenRouter as fallback
LLM_PROVIDERS = [p.strip() for p in os.getenv("LLM_PROVIDERS", "gemini,openrouter").split(",") if p.strip()]


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
