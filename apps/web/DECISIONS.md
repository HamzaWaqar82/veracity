# Veracity Website — Decision Log

A permanent, append-only record of engineering decisions for the website app. Each entry
answers *what we decided, why, what problem it solves, and how to work with it*. New entries are
added on top; history is never rewritten. If a decision is later superseded, add a new entry that
explicitly supersedes it rather than editing the old one.

---

## D-001 — Content model: two channels, one fact authority

**Status:** Accepted · **Date:** 2026-08-02 · **Scope:** `apps/web`

### The problem

`docs/web/srs-rag-chatbot-v1.md` **FR-DATA-1** states that markdown content is "the single source
of truth for both the website and the Assistant's retrieval corpus." Literally applied, that
would mean the rendered pages and the chatbot must be driven by the same markdown text.

In practice the two channels have incompatible needs:

- The **frontend** needs short, copywritten, SEO-keyword-bearing text that leaves room to breathe.
  Exhaustive detail would clutter the design and hurt conversion.
- The **chatbot corpus** needs verbose, complete, fact-dense text so the bot never has to guess,
  invent, or hallucinate — it must be able to refuse when the corpus doesn't answer.

Treating one artifact as both creates a false choice: either the pages get cluttered, or the bot
gets under-grounded. It also breaks the existing architecture, where the home page is built from
bespoke React components (ledger panel, animated hero) that no markdown renderer could reproduce.

### The decision

Adopt a **two-channel model**: same facts, different depth.

1. **`apps/web/content/` markdown is the fact authority and the retrieval corpus.** It is the only
   source the chatbot may answer from, and it is kept deliberately detailed and exhaustive so the
   bot never has to assume.
2. **Frontend copy lives in components** (`src/components/`, `src/app/`), written for the page:
   terse, SEO/UX-optimized, presentation-owned.
3. **The frontend copy must be a non-contradicting subset of the corpus.** It may be shorter, but
   it may not assert a fact the corpus contradicts — and ideally it states nothing the corpus
   doesn't cover at all, so the bot is never surprised by a claim on the page.
4. **Edits do not auto-propagate between channels.** Editing `home.md` changes the bot's answers,
   not the rendered home page. Editing a component changes the page, not the corpus. Sync is a
   deliberate, audited act.

FR-DATA-1 remains satisfied at the *structural* level: page titles, navigation labels, mega-menu
anchors, and blog titles are derived from the corpus at build time (`src/lib/site.ts`). Only the
*presentation copy* is component-owned — by design, not by omission.

### Why (what this solves)

- **No hallucinations:** the bot answers only from a corpus that is deliberately more detailed than
  the page, so it never guesses to fill gaps the terse UI leaves open.
- **No cluttered design:** the page keeps its copywritten, breathable copy; corpus depth lives where
  the visitor never has to read it.
- **No drift by accident:** a build-time fact check (see below) fails the deploy if a hardcoded
  price or guarantee on the page stops matching the corpus — protecting the zero-tolerance pricing
  gate and the "trust is architectural" positioning.
- **Clear ownership:** content editors know which channel to touch for which outcome.

### How to work with this

- **Changing what the page says:** edit the component. Then check the fact is still grounded in the
  corpus (run `npm run check:facts`); if the fact is new, add it to the corpus too.
- **Changing what the bot answers:** edit the corpus markdown, then re-run ingestion. Do not expect
  the page to change.
- **Hard facts (never ungrounded):** prices, plan limits, guarantees (no keystrokes / no video /
  no stealth / no emotion AI), compliance statutes, capture intervals, trial terms. These are
  enforced by `apps/web/frontend/scripts/check-facts.mjs` on every build.
- **Presentation copy** (framing, metaphor, UI-mock labels like the hero ledger) is exempt from the
  fact check but must never contradict the corpus.

### Alternatives considered

- **Option 2 — drive component copy from markdown at build time.** Keeps one source but forces the
  corpus to be written twice (once exhaustive for the bot, once terse for the UI) or the UI to
  render details it doesn't want. Extra machinery, no real win.
- **Option 3 — full markdown-rendered pages** (a real renderer in `[...slug]`). Most faithful to a
  literal reading of FR-DATA-1, but fights the bespoke component design and would either clutter
  the pages or require a second, truncated corpus — recreating the same split with more complexity.

### Consequences

- The rendered site and the RAG corpus are allowed to differ in wording and depth; they must agree
  on facts. This is intentional and documented here so future work doesn't treat the difference as
  a bug to "fix."
- The eval harness reads the corpus, so corpus edits affect scores; page edits do not. PRs touching
  retrieval must still state eval scores before/after (see `AGENTS.md`).

### References

- `apps/web/AGENTS.md` — "Sources of truth" (two-channel wording)
- `apps/web/PRODUCT.md` — Operating Context, Capabilities, Build Status, Principle #4
- `docs/web/srs-rag-chatbot-v1.md` — FR-DATA-1 (interpreted at structural level)
- `apps/web/frontend/scripts/check-facts.mjs` — the build-time fact guardrail

---

## D-002 — Conversion forms are per-flow, not one shared form

**Status:** Accepted · **Date:** 2026-08-05 · **Scope:** `apps/web`

### The problem

P1 shipped three conversion surfaces (`/contact-us`, `/request-demo`, `/trial`) as three
copy-paste near-identical forms: same field set (name/email/company/size/message), same
`mailto:sales@veracity.dev` funnel, same "reply within one business day" promise. Three different
intents — route an inquiry, book a 30-minute demo, start a self-serve trial — were given one
generic shape, which matched none of the real-world flows.

### The decision

Differentiate the forms by conversion intent while keeping a shared visual kit
(`src/components/form/`: field primitives, `FormCard`, `FormSuccessCard`, `mailtoHref`):

- **Trial (`/trial`)** — self-serve signup shape, minimal friction: Full name + Work email only.
  Highest-volume CTA; no essay, no company-size gates. Success state promises credentials by
  email (honest interim: manual setup).
- **Demo (`/request-demo`)** — schedule-shaped: coverage-focus select, preferred day, time-of-day
  window, and timezone selects (replaces an unschedulable free-text "preferred time"). Success
  state: available slots within one business day.
- **Contact (`/contact-us`)** — routed catch-all: topic select (Sales / Support / Privacy &
  compliance / Billing / Something else) determines the mailto inbox
  (`sales@` / `support@` / `privacy@` / `billing@`); the success card's fallback link points to the
  same routed inbox.

All three still submit via `mailto:` until `apps/app` ships real account creation (`/signup`) and
a scheduler integration.

### Why (what this solves)

- Trial friction was actively hurting the primary CTA; a trial signup shouldn't require a
  paragraph about intent.
- The demo form produced data a salesperson couldn't act on ("next Thursday-ish"); structured
  day/window/timezone is actionable.
- Support and privacy inquiries were piling into the sales inbox; topic routing sends each to the
  team that owns it, and the "write directly" link points at the same inbox the message used.

### How to work with this

- The kit enforces the shared brand shell; **each flow's field set and submit target are its own** —
  future edits must not re-merge the forms.
- Copy in success states must stay grounded: trial terms (14-day, no credit card) and the
  one-business-day SLA come from the corpus / `about-data.ts`; `npm run check:facts` gates it.
- The verify matrix (`/tmp/opencode/verify.mjs`) asserts the field sets differ and the contact
  topic routes to the correct inbox; keep those checks in sync with any field changes.

### Alternatives considered

- **One configurable form component.** Would need a big props surface (field schema, validation,
  target, success copy) and still end up with per-flow branches; three thin configs over a kit was
  simpler and more readable.
- **Embed a scheduler (Calendly/Cal.com) for the demo.** Real slot-picking, but a new external
  dependency, account/availability maintenance, and a styling clash with the impeccable design
  system — deferred until the app ships and sales volume justifies it.

### Consequences

- `/trial` mailto is an interim funnel; when `apps/app` ships, `/trial` becomes real account
  creation and `/signup`/`/signin` enter the flow (see `docs/web/p1-execution-plan.md` follow-ups).
- Contact routing assumes all four inboxes are monitored; if a team's inbox changes, update the
  `TOPICS` map in `ContactForm.tsx` and the SupportChannelsCard data together.
- The eval gate is unaffected (frontend-only change; no retrieval touched).

### References

- `docs/web/frontend-issues-audit.md` §3 — CTA flow findings and direction
- `docs/web/p1-execution-plan.md` — WS-5 + Implementation Status (2026-08-05)
- `apps/web/frontend/src/components/form/` — the shared kit
- `apps/web/frontend/src/components/{trial,demo,contact}/` — per-flow forms
