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
