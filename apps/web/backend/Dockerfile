# Veracity RAG backend — container image
# Deploys to any OCI runtime (Railway / Render / Fly / VM). The app bootstraps
# its own schema via init_db() in the FastAPI lifespan hook, so no separate
# migrate step is required (the DB must allow `CREATE EXTENSION vector`).
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

# Build/runtime deps: psycopg2 needs libpq; curl for healthchecks.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv (matches the local dev workflow) and sync the locked environment.
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv \
    && uv sync --frozen --no-dev

# Application source.
COPY . .

# Default port matches main.py / uvicorn below.
EXPOSE 8000

# Run under the venv uv created (uvicorn is a dependency). Schema bootstrap
# happens automatically on startup via the app's lifespan hook.
CMD ["sh", "-c", "uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
