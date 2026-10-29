# Veracity Website + RAG Bot — Deployment Runbook

Live architecture and operational guide. Decisions recorded in `DECISIONS.md` (D-020).
For the implementation plan, see `.hermes/plans/2026-08-12_104823-deployment-plan.md`.

## Topology

```
Browser ──▶ Vercel (Next.js, apps/web/frontend)
                │  /api/chat, /api/lead  (server routes, runtime=nodejs)
                │  forward X-Internal-Token
                ▼
         Backend (FastAPI, container)  ──▶ Postgres + pgvector
         (Railway/Render, private)          (Neon/Supabase)
```

- **Site:** `https://<site>` (Vercel, root `apps/web/frontend`, branch `main`).
- **Bot:** `https://<site>/api/chat` (proxied through Vercel to the backend). Same domain — satisfies "two live URLs" (DoD-1 / DEL-1) as site + bot endpoint.
- **Backend:** container platform, **not** publicly exposed except through the Vercel proxy. Reachable at `VERACITY_BACKEND_URL` set in Vercel.

## Secrets (never in git, never in the client bundle)

| Secret | Where | Used by |
|--------|-------|---------|
| `VERACITY_INTERNAL_TOKEN` | Vercel env + backend platform env | Trust boundary between Vercel and backend; forwarded as `X-Internal-Token` |
| `VERACITY_BACKEND_URL` | Vercel env | Frontend → backend origin |
| `DATABASE_URL` | Backend platform env | Postgres + pgvector connection |
| `OPENROUTER_API_KEY` | Backend platform env | LLM fallback chain |
| `GEMINI_API_KEY` | Backend platform env | Primary LLM |
| `LANGSMITH_API_KEY` | Backend platform env (optional) | Observability |
| `ALLOWED_ORIGINS` | Backend platform env | CORS allow-list (comma-separated, explicit — no `*`) |

Frontend client bundle contains **only** non-secret config. Never set a `NEXT_PUBLIC_*`
secret. The internal token lives only in server environments.

## Deploy steps

### Backend (one-time + each release)
1. Build & push the image: `docker build -t <registry>/veracity-backend:latest .` (root: `apps/web/backend`, `Dockerfile` present).
2. Deploy as a **private** service on Railway/Render; set the env vars above.
3. Attach managed Postgres (pgvector-capable). Confirm `CREATE EXTENSION vector` is allowed at the provisioned role.
4. The app bootstraps its own schema on startup via `init_db()` (idempotent: creates `vector` extension, `web_pages`, `web_chunks`, `web_chat_sessions`, `web_leads`). No separate migrate step.
5. Run ingestion so the bot has a corpus: `uv run python -m backend.ingestion` (from `apps/web/backend`); re-run after any `content/` change.
6. Health: `curl https://<backend>/health` → `{"status":"ok"}`. Metrics: `GET /metrics` (Prometheus text).

### Frontend (each release)
1. Vercel project: Root Directory = `apps/web/frontend`, Framework = Next.js, Build = `npm run build` (runs `check:facts` gate), Install = `npm ci`.
2. Set Vercel env: `VERACITY_BACKEND_URL`, `VERACITY_INTERNAL_TOKEN`, `NODE_ENV=production`.
3. Push to `main` → Vercel auto-deploys.

### CI eval (#49 / #53)
- `web-ci.yml` runs `eval` on merge to `main` when `vars.EVAL_ENABLED == 'true'`.
- Required: Actions secrets `API_URL` (prod/staging backend origin), `OPENROUTER_API_KEY`, `GEMINI_API_KEY`. Results commit to `eval/results/`.
- Eval hits the backend's `/api/chat` directly; if it bypasses the Vercel proxy, also set `VERACITY_INTERNAL_TOKEN` as a secret and have the harness send `X-Internal-Token`. (Current `eval/harness.py` posts to `{api_url}/api/chat` — add the header there if needed.)

## Lead storage
- `POST /api/lead` (backend) persists to the `web_leads` table in Postgres. The frontend `/api/lead` route **proxies** to the backend (no local JSONL). Leads survive redeploys.
- To inspect: `psql "$DATABASE_URL" -c "SELECT kind, email, received_at FROM web_leads ORDER BY received_at DESC LIMIT 50;"`

## NFR-SEC-1 evidence
- Chat is server-proxied; no model/DB key reaches the browser. The internal token is server-only.
- CI runs `check:facts` + a secret-leak check; production sourcemaps are grepped for key shapes during release.
- If a secret is ever committed: rotate it immediately (changing it in both envs + redeploy), then purge history (NFR-SEC-2 runbook) — deleting the commit alone is insufficient.

## Key rotation runbook (NFR-SEC-2)
1. Generate a new `VERACITY_INTERNAL_TOKEN` (e.g. `openssl rand -hex 32`).
2. Set the new value in **both** Vercel and the backend platform env.
3. Redeploy both. Old token stops working instantly.
4. For LLM keys: rotate at the provider, update the platform env, redeploy.

## Walkthrough justification (DEL-6)
- **Pricing numbers / compliance statutes / trial terms:** grounded in `content/` (the fact corpus); `npm run check:facts` gates the build so frontend copy cannot contradict the corpus.
- **Bot answers:** retrieved only from `content/`; unanswerable questions are refused and routed to `/contact-us` (see `REFUSAL_CONTACT_URL` in `config.py`).
- **Performance numbers:** Lighthouse sweeps committed under `apps/web/lighthouse/`; mobile <90 on 5 animation-heavy routes is tracked as issue #101 (accepted residual for this phase).

## Known gaps / follow-ups
- **#101** — mobile Lighthouse <90 on 5 routes; schedule a perf overhaul.
- **Eval cost** — runs on every `main` merge; watch OpenRouter/Gemini quota; consider manual/scheduled trigger if quota is tight.
- **No multi-region** — single-region MVP; note in runbook for future scale-out.
