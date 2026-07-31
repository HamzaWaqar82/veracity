# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4. Frontend lives at `apps/web/frontend/`. Deployed to Vercel. Backend is Python FastAPI + LangChain at `apps/web/backend/`, PostgreSQL + pgvector, OpenRouter → Mistral/Mixtral.

## Repo Context

This app is `apps/web` in the **FSMS monorepo** (`staff-monitoring-system`), which also contains `apps/app` (the core SaaS — not built yet) and `packages/` (empty). Work is scoped to one app per session — never mix. Requirements and brand live in `docs/` at the repo root — `docs/company/` is shared brand, `docs/web/` is this app's requirements, `docs/saas/` is the other app — and are **local-only, not committed to git**. `docs/company/brand.md` is the single source of truth for positioning, tone, and messaging; represent it verbatim, never re-derive it.

## Users

- **Primary:** Business decision-makers at SMBs (10–200 employees) — owners, CEOs, ops leaders — evaluating workforce analytics tools for their remote/hybrid teams
- **Secondary:** HR and compliance officers assessing legal fit, privacy guarantees, and jurisdiction coverage
- **Tertiary (via chatbot):** Site employees, managers, and IT admins asking detailed feature/comparison questions

## Product Purpose

A sales and marketing website for the FSMS workforce analytics platform. Its job is to explain what FSMS is, demonstrate why it is different, answer visitor questions via an embedded RAG chatbot, and convert interest into demos/trials. The site itself is the pre-MVP build — it ships before any core SaaS code exists — so its content markets a product that is being built, not yet live.

## Positioning

**For** SMBs with remote and hybrid teams (10–200 employees)  
**who** are caught between surveillance tools that destroy trust and time trackers that can't verify real productivity,  
**our** FSMS (Fair Surveillance Management System)  
**is a** workforce analytics platform  
**that** delivers verifiable productivity insights through employee-visible monitoring — published scoring with confidence indicators, client-side redaction, drift-proof compliance, and structural privacy guarantees.  
**Unlike** heavyweight surveillance suites like Teramind or oversimplified binary trackers like ActivTrak,  
**we** make trust architectural — the agent doesn't just claim to be transparent, it proves it by reporting its actual capture state on every heartbeat, and the server alerts when reality drifts from policy.

## Operating Context

- Visitors arrive at the site from search, referral, or direct — researching workforce monitoring tools
- They compare FSMS against known alternatives (Teramind, ActivTrak, Hubstaff, Time Doctor)
- They want answers to specific questions: pricing, features, compliance, integrations
- The chatbot must answer accurately from site content alone, never from model prior knowledge
- A wrong pricing answer fails the entire project — zero tolerance
- Content is markdown at `apps/web/content/`, serving as single source of truth for both rendered pages and chatbot retrieval

## Capabilities and Constraints

- 7 pages (Home, Features, Pricing, About/Blog, Integrations, Compliance, Case Studies) + FAQ with 37 entries
- 15,535 words of real, non-placeholder content across all pages
- 3 product tiers with overlapping features (Starter $6/mo, Growth $12/mo, Enterprise $24/mo)
- Pricing comparison table — single source of truth for all pricing answers
- RAG chatbot embedded site-wide, answering only from site content
- Streaming responses (SSE) via Python FastAPI backend
- Multi-turn conversation with referential follow-up resolution
- Cross-product comparison with per-fact citations
- Prompt-injection resistance — retrieved content treated as untrusted data
- Live re-ingestion demo: edit markdown, re-run ingestion, answer changes
- Responsive across mobile (375px+), tablet (768px+), desktop (1024px+)
- Lighthouse 90+ on Performance and Accessibility
- Keyboard navigation and screen reader support
- Deliberate design system with tokens and component patterns
- No no-code/low-code builders
- No fine-tuning of any model
- No client-side secrets — all keyed calls proxied server-side
- No secrets in repo at any point in history

## Brand Commitments

- **Name:** FSMS — Fair Surveillance Management System
- **Tagline:** "Workforce Analytics Built on Trust, Not Surveillance"
- **Voice:** Transparent, principled, contrarian, educational. Speaks in specific, verifiable claims, not slogans. Explains the "why" behind every design decision. Honest enough to state where the product does not fit.
- **Core promise:** You don't have to choose between visibility and trust.
- **Never-ever guarantees (product, not marketing):**
  - No keystroke logging, ever, in any version
  - No continuous video recording
  - No stealth or covert mode
  - No emotion recognition or biometric inference
- **Tone shifts by page intent:** Reassuring on Home, persuasive on Why-FSMS, specification-grade on Features, personal on About
- **Anti-selling:** Explicitly states when FSMS is not the right fit (enterprises 200+, DLP needs, on-premise, covert monitoring)

## Evidence on Hand

- 15,535 words of content across `content/pages/` (9 pages) and `content/faq/faq.md` (37 entries)
- All content grounded in the website requirements — `docs/web/srs-rag-chatbot-v1.md` and `docs/web/FSMS-WEB-Evaluation-Specification.md` — plus `docs/company/brand.md`. (Local-only; the old "SRS v4" document is deliberately excluded from this monorepo — references to it map to `docs/web/` here.)
- Backend RAG pipeline at `apps/web/backend/` — FastAPI, LangChain, PostgreSQL + pgvector, OpenRouter
- Eval framework at `apps/web/eval/` — 50-question set, LangSmith harness, score history
- Frontend scaffold at `apps/web/frontend/` — Next.js 15, Tailwind v4, TypeScript
- App README at `apps/web/README.md` (no architecture diagram or decisions doc yet — write fresh when needed)
- Full stakeholder research dossier with competitor analysis (Teramind, ActivTrak, Hubstaff, Time Doctor gaps mapped)
- Published feature-by-feature comparison table in content against all named competitors

## Current Build Status

PRODUCT.md describes the **target product**. What is actually committed in this repo today:

- **Complete:** content corpus (`apps/web/content/`), eval harness + 50-question set (`apps/web/eval/`), backend/frontend/config scaffold
- **Stubbed:** `apps/web/backend/ingestion.py` and `apps/web/backend/rag.py` are `pass` placeholders; `apps/web/backend/main.py` exposes only `/health` — there is no `/api/chat` route yet
- **Not built:** rendered site pages (frontend serves a "Coming soon" page), chatbot UI + API client, live ingestion, passing eval
- The one committed eval result (`apps/web/eval/results/20260730T094852Z.json`) is **0/50 passed, all connection errors** — the harness never ran against a live backend

The website is the pre-MVP build: content and evaluation precede implementation. Building the pipeline and pages is the next phase of work.

## Product Principles

1. **Trust is architectural, not rhetorical.** Every feature either builds or erodes trust. Privacy guarantees are enforced by the agent locally and verified server-side via drift detection — not just stated in a policy.

2. **Truth over helpfulness.** A wrong answer is worse than no answer. The chatbot must refuse rather than guess. Pricing is a hard fail gate — one mistake fails the project.

3. **Eval-first.** Measure before you build. The 50-question evaluation set was written before any retrieval code. Scores are committed to the repo on every run. Early low scores are reported, not hidden.

4. **Content is the single source of truth.** One markdown content layer serves both the rendered website and the chatbot retrieval corpus. Editing content and re-running ingestion changes both — demonstrable live.

5. **Transparency through constraint.** What we deliberately exclude (no keystrokes, no video, no stealth, no emotion AI) defines the product as much as what we include. These are marketed as product guarantees, not engineering footnotes.

## Accessibility & Inclusion

- Target WCAG 2.1 AA, verified via Lighthouse 90+ on every shipped page
- Keyboard navigation and screen reader compatibility — tested, not assumed
- Responsive design: 375px / 768px / 1024px+ breakpoints
- Minimal cognitive load: published methodology, confidence flags, employee-visible data
- Privacy-by-design: collection is visible, contestable, and controllable by the person being monitored
