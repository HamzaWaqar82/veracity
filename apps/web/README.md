# FSMS Website & RAG Assistant

Marketing site for **FSMS — Fair Surveillance Management System** — a transparent, privacy-respecting employee monitoring platform — with an embedded RAG chatbot answering questions from site content.

> This is `apps/web` in the FSMS monorepo. Requirements and brand live in `docs/` at the repo root (`docs/web/`, `docs/company/`) — local-only, not committed. CI lives at the repo root: `.github/workflows/web-ci.yml`.

## Architecture

```
Frontend (Next.js) ──► Backend (FastAPI) ──► PostgreSQL + pgvector ──► OpenRouter (Mistral/Mixtral)
```

- **Frontend:** Next.js (App Router) → Vercel
- **Backend:** Python FastAPI → Render/Railway
- **Vector store:** PostgreSQL + pgvector
- **LLM:** OpenRouter (Mistral 7B / Mixtral)
- **Eval:** LangSmith eval suite

## Quick Start

All commands run from `apps/web/`.

```bash
# Backend
cd backend
uv sync
uv run uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Eval

```bash
uv run python eval/harness.py --api-url http://localhost:8000
```

## Pre-commit

```bash
uv run pre-commit install
```

## Repo Structure

```
├── frontend/       # Next.js app
├── backend/        # FastAPI + RAG pipeline
├── content/        # Markdown (single source of truth)
│   ├── pages/      #   Website page content
│   └── faq/        #   FAQ entries
└── eval/           # Eval questions, harness, results
```

Requirements and brand live outside this app, at the monorepo root `docs/` (gitignored). CI is at the root `.github/workflows/web-ci.yml`. See `PRODUCT.md` for the current build status.
