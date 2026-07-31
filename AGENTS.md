# AGENTS.md

## What this repo is

The **Veracity monorepo**: two independent apps sharing one brand.

- `apps/web/` — the marketing website + content-grounded RAG assistant (the only app with code today).
- `apps/app/` — the core SaaS (Activity Tracking, Visual Monitoring, Productivity Analytics, Employee Self-Service, Compliance & Governance, Business/Admin). **Not built yet** — scaffold only.
- `packages/` — future shared packages. Empty by design; **do not** introduce workspace tooling (pnpm/npm workspaces, turborepo) until real shared code exists.
- `docs/` — requirements. **LOCAL ONLY, not committed to git.** If `docs/` is missing, ask the owner to restore it before doing doc-grounded work.

## THE rule — one app per session, never mix

This repo exists because two products were previously confused by mixing their requirements. Work in **exactly one app per session**:

- Work on the **website** → read only `apps/web/AGENTS.md` + `docs/web/` + `docs/company/brand.md`. Ignore `docs/saas/`.
- Work on the **SaaS** → read only `apps/app/AGENTS.md` + `docs/saas/` + `docs/company/brand.md`. Ignore `docs/web/`.

**Brand authority:** `docs/company/brand.md` is the single source of truth for positioning, ICP, tone, and messaging for BOTH apps. Represent it verbatim; never re-derive or invent brand/positioning from product requirements.

## Docs layout (local-only)

```
docs/
  company/   brand.md, vision.md        — SHARED by both apps
  saas/      Veracity RE artifacts       — SaaS requirements
  web/       srs-rag-chatbot-v1.md, Veracity-WEB-Evaluation-Specification.md, Rag Chatbot..docx
```

Key authority notes:

- `docs/saas/Veracity-SRS-v3.md` — authoritative SaaS baseline. Modules: AT, VM, PA, ES, CG, BUS, NFR. Requirements carry IDs (`AT-FR-001`), MoSCoW priorities, effort, and **evidence tags** `[COMPLAINT]` `[LEGAL]` `[GAP]` `[UNVALIDATED]` — tags are part of the requirement, never drop them.
- `docs/web/srs-rag-chatbot-v1.md` — website + RAG requirements (FR-SITE / FR-BOT / FR-DATA / NFR-* / EVAL / PROC / DEL). `docs/web/Veracity-WEB-Evaluation-Specification.md` — standalone, authoritative 50-question eval spec, maintained independently of any SRS.
- **SRS v4 and the Phase-6 baseline are deliberately excluded** from this repo: v4 merged website + SaaS constraints into one document and confused coding agents. Website and SaaS requirements are separate on purpose. If you see a reference to "SRS v4 §3.7 / WEB module," that content belongs to `docs/web/` here.
- `ENGINEERING-CONCEPTS.md` and `IMPLEMENTATION-PLAN.md` do not exist yet — write them fresh when needed, don't expect them.

## Website app (`apps/web`)

Read `apps/web/AGENTS.md` before working there. Highlights: eval-first culture (run the eval suite, commit score history), pricing answers are a hard-fail gate, **no secrets/keys in git history at any point**, no fine-tuning, no no-code builders, Python + Postgres backend, no API keys reachable from the browser client.

## SaaS app (`apps/app`)

Read `apps/app/AGENTS.md` before working there. Nothing exists yet — do not invent structure; let requirements drive it.

## Gotchas

- `docs/web/` contains `Rag Chatbot..docx` — always quote paths.
- `Veracity-SRS-v3.md` duplicates its title block (intro repeated after the TOC) — a known artifact of merging modular parts, not something to "fix."
- The website content ground-claims "SRS v4 grounding" (see `apps/web/content/`) — that grounding document is intentionally not in this repo; the brand + `docs/web/` requirements are the working sources.
- No root build commands. Every app has its own toolchain (see per-app READMEs). `apps/web` = Next.js + FastAPI/uv; `apps/app` = nothing yet.
