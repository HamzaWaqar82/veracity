# Veracity Monorepo

Monorepo for **Veracity** — a workforce activity monitoring / productivity analytics SaaS — plus its marketing website and content-grounded RAG assistant.

## Layout

```
apps/
  web/       # Marketing website + RAG assistant (Next.js frontend, FastAPI backend)
  app/       # Core SaaS (AT/VM/PA/ES/CG/BUS) — scaffold only, not built yet
packages/    # Future shared packages (brand, config, ui) — empty placeholder
docs/        # Requirements — LOCAL ONLY, not committed to git (see AGENTS.md)
```

The two apps are independent products that share one brand. Work in **one app per session**; never mix their requirements. See `AGENTS.md` for the context rules.

## apps/web — Website & RAG Assistant

Marketing site for Veracity with an embedded chatbot that answers only from site content.

```
Frontend (Next.js) ──► Backend (FastAPI) ──► PostgreSQL + pgvector ──► OpenRouter (Mistral/Mixtral)
```

```bash
# Backend
cd apps/web/backend
uv sync
uv run uvicorn main:app --reload

# Frontend
cd apps/web/frontend
npm install
npm run dev

# Eval suite
cd apps/web
uv run python eval/harness.py --api-url http://localhost:8000
```

Eval results are committed on every run (`apps/web/eval/results/`) — score history is part of the deliverable.

## apps/app — Core SaaS

Not started. Scaffold only (`README.md` + `AGENTS.md`). Node.js/TypeScript + PostgreSQL + Redis per the requirements.

## packages/

Placeholder for shared packages. Do not introduce workspace/monorepo tooling (pnpm workspaces, etc.) until there is real shared code to justify it — the two apps use different stacks and are independent today.
