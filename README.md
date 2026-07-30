# FSMS Website & RAG Assistant

Marketing site for **Fair Screen Monitoring System** — a transparent, privacy-respecting employee monitoring platform — with an embedded RAG chatbot answering questions from site content.

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

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Eval

```bash
cd eval
python harness.py --api-url http://localhost:8000
```

## Repo Structure

```
├── frontend/       # Next.js app
├── backend/        # FastAPI + RAG pipeline
├── content/        # Markdown (single source of truth)
│   ├── pages/      #   Website page content
│   └── faq/        #   FAQ entries
├── eval/           # Eval questions, harness, results
├── docs/           # Architecture, decisions
└── .github/workflows/  # CI
```
