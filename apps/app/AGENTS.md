# AGENTS.md — apps/app (Core SaaS)

You are working **only** on the FSMS core SaaS product. Nothing exists here yet — scaffold only. See root `AGENTS.md` first.

## Goals

- Deliver the product functionality defined by the requirements
- Build scalable, secure architecture (Node.js/TypeScript server, PostgreSQL with RLS, Redis, Go agent, React/Next portal — per the SRS)
- Honor the product's legal and trust boundaries

## Sources of truth (read only these)

- **Requirements:** `docs/saas/FSMS-SRS-v3.md` — the authoritative baseline. Modules: AT, VM, PA, ES, CG, BUS, NFR. Requirement IDs like `AT-FR-001`, MoSCoW priority, effort, and evidence tags (`[COMPLAINT]` `[LEGAL]` `[GAP]` `[UNVALIDATED]`) are part of the requirement — never drop them. Supporting artifacts in `docs/saas/` (RE process plan, dossier, elicitation log, analysis report, validation report).
- **Brand:** `docs/company/brand.md` — product-facing expression of the brand; the never-ever guarantees (no keystrokes, no continuous video, no stealth, no emotion recognition) are binding constraints.

Ignore `docs/web/` entirely.

## Do NOT

- Create landing pages, blog posts, or marketing content — that belongs in `apps/web`
- Optimize SEO or write marketing copy
- Design site content from SaaS requirements; the website has its own requirements
- Copy `docs/web/` requirements into this app; "SRS v4" and the WEB module do not exist here

## Hard boundaries from the requirements

- **Never**: keystroke logging, continuous video, stealth mode, on-premise-only claims, emotion recognition/biometric inference
- Product guarantees: <1% CPU / <50MB RAM agent, transparent capture state in every heartbeat, client-side redaction, jurisdiction-aware compliance
- EU AI Act / GDPR are process gates (DPIA, conformity) — compliance is by process gate, not code alone

## Current state

Scaffold only (`README.md`). Do not invent structure — let the requirements drive the build. This app has no build commands yet.
