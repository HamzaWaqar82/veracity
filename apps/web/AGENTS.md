# AGENTS.md — apps/web (Website & RAG Assistant)

You are working **only** on the Veracity marketing website and its content-grounded RAG assistant. This is the only app with code today. See root `AGENTS.md` first.

## Goals

- Communicate the product value and convert interest into demos/trials
- Improve SEO, accessibility (WCAG 2.1 AA / Lighthouse 90+), and performance (p95 latency < 5s time-to-first-token)
- Keep the chatbot accurate — **a wrong answer is worse than no answer**

## Sources of truth (read only these)

- **Requirements:** `docs/web/srs-rag-chatbot-v1.md` (FR-SITE / FR-BOT / FR-DATA / NFR / EVAL / PROC / DEL) and `docs/web/Veracity-WEB-Evaluation-Specification.md` (the 50-question eval harness spec)
- **Brand:** `docs/company/brand.md` — represent positioning, voice, and messaging **verbatim**. Never re-derive or invent brand/positioning from requirements. The site is grounded in the SaaS brand; do not let SaaS requirements leak in as marketing claims.
- **App context:** `PRODUCT.md` (this directory), `content/`, and `DECISIONS.md` (decision log — read it; D-001 defines the content model)
- **Content model (see DECISIONS.md D-001):** `content/` markdown is the **fact authority + retrieval corpus** — the bot answers ONLY from it, and it is kept detailed so the bot never guesses. Frontend copy lives in **components**, written for the page: terse, SEO/UX-optimized. The page is a **non-contradicting subset** of the corpus — shorter, never different. Edits do **not** auto-propagate between channels.

Ignore `docs/saas/` entirely.

## Do NOT

- Build SaaS internals (dashboards, monitoring agent, scoring, APIs for the product) — that belongs in `apps/app`
- Design marketing content from SaaS requirements; the SaaS SRS is not the site's content spec
- Fine-tune any model · use no-code/low-code builders
- Put secrets/keys in git history **at any point** · expose API keys to the browser client (all keyed calls proxied server-side)

## Eval culture (hard gates)

- Pricing/plan answers are zero-tolerance: **one violation fails the module** — treat pricing as a distinct, higher-scrutiny code path
- Frontend copy must never contradict the corpus — `npm run check:facts` gates the build (prices, guarantees, plan limits, compliance statutes, trial terms)
- Run the eval suite (`uv run python eval/harness.py --api-url http://localhost:8000`) and **commit score history** to `eval/results/` on each run
- Any PR touching retrieval logic must state eval scores before/after
- Unanswerable questions must be refused **and** routed to a contact channel; hedging counts as wrong

## Stack

Next.js 15 (App Router, `frontend/`) → Vercel; Python FastAPI + LangChain (`backend/`, uv) → PostgreSQL + pgvector → OpenRouter (Mistral/Mixtral). No secrets in `.env.example`; real `.env` is gitignored.

## Gotchas

- **Never run `npm run build` while `next dev` is running** — both write into the same `.next` directory, and the build's vendor-chunk set wipes the dev chunks (e.g. `vendor-chunks/gsap.js` disappears). The next recompile of a route then 500s with `Cannot find module './vendor-chunks/gsap.js'`. If a build is needed: stop the dev server → build → restart dev. If the site 500s with a missing `vendor-chunks/*.js`, `rm -rf frontend/.next` and restart `npm run dev` — the cache regenerates from source (`.next` is gitignored).
- Dev server logs: `npm run dev` from `apps/web/frontend`; backend: `uv run uvicorn main:app --port 8000` from `apps/web/backend` (uses `apps/web/backend/.env`); Postgres is the `veracity-postgres` Docker container (pgvector, port 5432).
