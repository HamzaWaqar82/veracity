# Product

<!-- impeccable:product-schema 1 -->

## Register

brand

## Platform

web

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4. Frontend lives at `apps/web/frontend/`. Deployed to Vercel. Backend is Python FastAPI + LangChain at `apps/web/backend/`, PostgreSQL + pgvector, OpenRouter → Mistral/Mixtral.

## Repo Context

This app is `apps/web` in the **Veracity monorepo** (`veracity`), which also contains `apps/app` (the core SaaS — not built yet) and `packages/` (empty). Work is scoped to one app per session — never mix. Requirements and brand live in `docs/` at the repo root — `docs/company/` is shared brand, `docs/web/` is this app's requirements, `docs/saas/` is the other app — and are **local-only, not committed to git**. `docs/company/brand.md` is the single source of truth for positioning, tone, and messaging; represent it verbatim, never re-derive it.

## Users

- **Primary:** Business decision-makers at SMBs (10–200 employees) — owners, CEOs, ops leaders — evaluating workforce analytics tools for their remote/hybrid teams
- **Secondary:** HR and compliance officers assessing legal fit, privacy guarantees, and jurisdiction coverage
- **Tertiary (via chatbot):** Site employees, managers, and IT admins asking detailed feature/comparison questions

## Product Purpose

A sales and marketing website for the Veracity workforce analytics platform. Its job is to explain what Veracity is, demonstrate why it is different, answer visitor questions via an embedded RAG chatbot, and convert interest into demos/trials. The site itself is the pre-MVP build — it ships before any core SaaS code exists — so its content markets a product that is being built, not yet live.

## Positioning

**For** SMBs with remote and hybrid teams (10–200 employees)
**who** are caught between surveillance tools that destroy trust and time trackers that can't verify real productivity,
**our** Veracity
**is a** workforce analytics platform
**that** delivers verifiable productivity insights through employee-visible monitoring — published scoring with confidence indicators, client-side redaction, drift-proof compliance, and structural privacy guarantees.
**Unlike** heavyweight surveillance suites like Teramind or oversimplified binary trackers like ActivTrak,
**we** make trust architectural — the agent doesn't just claim to be transparent, it proves it by reporting its actual capture state on every heartbeat, and the server alerts when reality drifts from policy.

## Operating Context

- Visitors arrive at the site from search, referral, or direct — researching workforce monitoring tools
- They compare Veracity against known alternatives (Teramind, ActivTrak, Hubstaff, Time Doctor)
- They want answers to specific questions: pricing, features, compliance, integrations
- The chatbot must answer accurately from site content alone, never from model prior knowledge
- A wrong pricing answer fails the entire project — zero tolerance
- Content is markdown at `apps/web/content/` — the **fact authority + retrieval corpus** for the chatbot. Frontend copy lives in components as a condensed, non-contradicting subset (see `DECISIONS.md` D-001). Page structure (titles, nav, anchors) is derived from the corpus at build time

## Capabilities and Constraints

- 9 pages (Home, Features, Pricing, About, Blog, Integrations, Compliance, Case Studies, Why Veracity) + 3 blog posts + FAQ with 37 entries
- 19,179 words of real, non-placeholder content across all pages
- 3 product tiers with overlapping features (Starter $6/mo, Growth $12/mo, Enterprise $24/mo)
- Pricing comparison table — single source of truth for all pricing answers
- **Built:** home page as bespoke React components; other pages via a Next.js dynamic `[...slug]` route (16 routes) whose titles/nav/anchors derive from the markdown corpus; mega-menu header with panels grounded in page anchors; mobile full-screen dialog nav; design system with tokens (`globals.css`) and documented components
- **Target (not yet built):** RAG chatbot embedded site-wide answering only from site content; streaming responses (SSE) via Python FastAPI backend; multi-turn conversation with referential follow-up resolution; cross-product comparison with per-fact citations; live re-ingestion demo (edit markdown, re-run ingestion, answer changes)
- Prompt-injection resistance — retrieved content treated as untrusted data (pipeline design principle)
- Responsive across mobile (375px+), tablet (768px+), desktop (1024px+) — verified, zero horizontal overflow
- WCAG 2.1 AA: contrast ≥4.5:1 verified, keyboard navigation and `:focus-visible`, `prefers-reduced-motion` honored
- Lighthouse 90+ on Performance and Accessibility (target, verified via headless probes)
- No no-code/low-code builders
- No fine-tuning of any model
- No client-side secrets — all keyed calls proxied server-side
- No secrets in repo at any point in history

## Brand Commitments

- **Name:** Veracity
- **Tagline:** "Workforce Analytics Built on Trust, Not Surveillance"
- **Voice:** Transparent, principled, contrarian, educational. Speaks in specific, verifiable claims, not slogans. Explains the "why" behind every design decision. Honest enough to state where the product does not fit.
- **Core promise:** You don't have to choose between visibility and trust.
- **Never-ever guarantees (product, not marketing):**
  - No keystroke logging, ever, in any version
  - No continuous video recording
  - No stealth or covert mode
  - No emotion recognition or biometric inference
- **Tone shifts by page intent:** Reassuring on Home, persuasive on Why-Veracity, specification-grade on Features, personal on About
- **Anti-selling:** Explicitly states when Veracity is not the right fit (enterprises 200+, DLP needs, on-premise, covert monitoring)

## Conversion & proof

- **Primary CTA:** Start Free Trial — 14 days, full access to all features of the chosen plan, no credit card required.
- **Secondary fallbacks:** View Pricing (for price-shopping visitors) and Contact Sales (for visitors not ready to self-serve).
- **The line a visitor remembers after 10 seconds:** You don't have to choose between visibility and trust.
- **Belief ladder (in order, before the primary CTA):**
  1. Today's options are both broken for SMBs — surveillance tools destroy trust, time trackers can't verify real productivity.
  2. Real visibility doesn't require covert monitoring; transparency can be the mechanism, not the risk.
  3. Veracity's trust isn't a promise, it's architectural — employee-visible capture, published confidence indicators, client-side redaction, drift detection — and it's priced for SMBs, not enterprises.
  4. Starting is safe and cheap: 14-day free trial, no credit card, no seat minimum, all features included.
- **Proof on hand:** real narrative case studies at `content/pages/case-studies.md` (Luminate Digital and peers), the 19,179-word grounded content corpus, the published feature-by-feature comparison against named competitors, and the 50-question eval harness + committed score history at `apps/web/eval/`.

## Brand Personality

- **Three words:** Trustworthy, precise, humane.
- **Voice:** transparent, principled, contrarian, educational — specific, verifiable claims, never slogans; explains the "why" behind every design decision; honest enough to state where the product does not fit.
- **Emotional goal:** the combined strategy — calm confidence (the relief of "we can stop guessing"), clear-eyed reassurance (someone finally explains monitoring without fear-mongering), and principled conviction (a brand with backbone, on the employee's side).
- **Tone shifts by page intent:** reassuring on Home, persuasive on Why-Veracity, specification-grade on Features, personal on About.

## Anti-references

This site must never read as:

- **A generic AI/SaaS template** — cream/sand backgrounds, gradient text, tiny uppercase eyebrows on every section, identical icon-card grids.
- **A surveillance / enterprise-tool aesthetic** — dark control-center dashboards, cold dense grids, red alert accents, CCTV overtones.
- **A dark cyber / hacker aesthetic** — glowing neon, terminal fonts, "we see everything" overtones.
- **A corporate brochure** — stock-photo blandness, vague slogans, no specifics, no backbone.

## Evidence on Hand

- 19,179 words of content across `content/pages/` (12 files: 9 pages + 3 blog posts) and `content/faq/faq.md` (37 entries)
- All content grounded in the website requirements — `docs/web/srs-rag-chatbot-v1.md` and `docs/web/Veracity-WEB-Evaluation-Specification.md` — plus `docs/company/brand.md`. (Local-only; the old "SRS v4" document is deliberately excluded from this monorepo — references to it map to `docs/web/` here.)
- Backend RAG pipeline at `apps/web/backend/` — FastAPI, LangChain, PostgreSQL + pgvector, OpenRouter
- Eval framework at `apps/web/eval/` — 50-question set, LangSmith harness, score history
- Frontend implementation at `apps/web/frontend/` — Next.js 15 (App Router), React 19, Tailwind v4, TypeScript; 16 static routes, titles/nav/anchors derived from the markdown corpus, presentation copy in components (see `DECISIONS.md` D-001); design system captured in `apps/web/DESIGN.md` with `.impeccable/design.json` sidecar and live-mode config at `.impeccable/live/config.json`
- App README at `apps/web/README.md` (no architecture diagram or decisions doc yet — write fresh when needed)
- Full stakeholder research dossier with competitor analysis (Teramind, ActivTrak, Hubstaff, Time Doctor gaps mapped)
- Published feature-by-feature comparison table in content against all named competitors

## Current Build Status

PRODUCT.md describes the **target product**. What is actually in this repo today:

- **Complete:** content corpus (`apps/web/content/` — 9 pages, 3 blog posts, 37 FAQ entries), eval harness + 50-question set (`apps/web/eval/`), and the rendered marketing site — Next.js frontend serving 16 static routes with page structure derived from the markdown corpus and presentation copy in components (see `DECISIONS.md` D-001), with the full design system (tokens, mega-menu header, dialog mobile nav, CursorRing, ten home-page sections) verified responsive and accessible
- **Stubbed:** `apps/web/backend/ingestion.py` and `apps/web/backend/rag.py` are `pass` placeholders; `apps/web/backend/main.py` exposes only `/health` — there is no `/api/chat` route yet
- **Not built:** chatbot UI + API client, live ingestion, streaming answers, passing eval (the one committed eval result `apps/web/eval/results/20260730T094852Z.json` is 0/50 passed, all connection errors — the harness never ran against a live backend)

The website is the pre-MVP build: content, evaluation, and the marketing pages precede the chatbot pipeline. Building the backend pipeline and chatbot UI is the next phase of work.

## Product Principles

1. **Trust is architectural, not rhetorical.** Every feature either builds or erodes trust. Privacy guarantees are enforced by the agent locally and verified server-side via drift detection — not just stated in a policy.

2. **Truth over helpfulness.** A wrong answer is worse than no answer. The chatbot must refuse rather than guess. Pricing is a hard fail gate — one mistake fails the project.

3. **Eval-first.** Measure before you build. The 50-question evaluation set was written before any retrieval code. Scores are committed to the repo on every run. Early low scores are reported, not hidden.

4. **Content is the fact authority; the page is its subset.** The markdown corpus serves the chatbot retrieval and carries every hard fact (prices, guarantees, limits, compliance). Rendered pages derive their structure from it and keep a condensed, copywritten presentation that must never contradict it. A build-time fact check (`npm run check:facts`) blocks drift. Editing content and re-running ingestion changes the bot's answers — demonstrable live.

5. **Transparency through constraint.** What we deliberately exclude (no keystrokes, no video, no stealth, no emotion AI) defines the product as much as what we include. These are marketed as product guarantees, not engineering footnotes.

## Accessibility & Inclusion

- Target WCAG 2.1 AA, verified via Lighthouse 90+ on every shipped page
- Keyboard navigation and screen reader compatibility — tested, not assumed
- Responsive design: 375px / 768px / 1024px+ breakpoints
- Minimal cognitive load: published methodology, confidence flags, employee-visible data
- Privacy-by-design: collection is visible, contestable, and controllable by the person being monitored
