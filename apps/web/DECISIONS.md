# Veracity Website — Decision Log

A permanent, append-only record of engineering decisions for the website app. Each entry
answers *what we decided, why, what problem it solves, and how to work with it*. New entries are
added on top; history is never rewritten. If a decision is later superseded, add a new entry that
explicitly supersedes it rather than editing the old one.

---

## D-011 — Chat widget root cause: closed `<dialog>` rendered visible by `.flex`

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

The chat panel never actually disappeared, in any browser, even after the close logic in
D-008/D-009/D-010 was verified correct. Reproduced verbatim across many reports as "the chatbot is
on the UI all the time and does not disappear" / "the panel opens at the start of the webpage and
never disappears". Cache-clearing, hard restarts and other browsers changed nothing.

### Root cause (proven, not guessed)

The `<dialog>` element carries Tailwind's `flex` utility. The browser's user-agent rule
`dialog:not([open]) { display: none }` lives in the UA origin; author-origin normal declarations
beat UA-origin normal declarations **regardless of specificity and layers**. So the author `.flex`
overrode the UA hidden rule, and the closed dialog was always rendered as a visible 384x532px box at
the bottom-right of every page.

Clicking the launcher/header-X **did** close the dialog logically (`open=false`, backdrop removed,
focus returned to the launcher) - but the panel stayed painted. That is why users saw "focus shifts
to the webpage" while "the panel never disappears": the close worked, the box never hid.

Earlier verification was incomplete: it asserted `dialog.open` / `aria-expanded` / icon state, never
computed `display`. `open=false` with `display:flex` is a closed-but-visible dialog; every "pass" up
to D-010 checked the property, not the paint.

### The decision

Drive the dialog's display from its own `[open]` attribute with higher-specificity author CSS:

    className="... flex ... [&:not([open])]:hidden"

`[&:not([open])]:hidden` compiles to `&:not([open])` with specificity (0,2,0), beating `.flex`
(0,1,0) in the same origin/layer. Closed -> `display:none`; modal/open -> `flex`. It is
state-independent: tied to the browser's real `[open]` attribute, so no React-state desync can
reintroduce a visible closed panel.

### How to work with this

- A `<dialog>` given a `display` utility class is **always rendered** when closed - the UA's
  `dialog:not([open]) { display:none }` loses to any author-origin display rule. Either do not set a
  display utility on a `<dialog>`, or pair it with a `:not([open])` hidden rule as above.
- For top-layer / `[open]`-driven widgets, verify with **computed `display`** (and a zero
  rect), never only the `open` property. `getComputedStyle(el).display` is the honest paint check.
- Tests that measure a hidden element's rect get (0,0) - measure interior click targets only while
  the element is actually open.

### Consequences

- Verified on the live build: closed dialog is `display:none` / rect 0x0 on load and after
  launcher/backdrop/X/Escape close; `display:flex` when modal; panel no longer covers the
  bottom-right of pages. Pricing regression 5/5; real-click toggle matrix 8/8 (with the interior
  click coordinate now measured while open); soft-nav closes the dialog.
- No copy/facts impact; lint, `check:facts`, build pass.

### References

- `apps/web/frontend/src/components/chat/ChatWidget.tsx`
- Supersedes the diagnosis in D-008/D-009/D-010 as the *complete* explanation of the visible panel;
  their fixes remain correct and necessary.

---

## D-008 — P2 batch: chat dialog inset + friendly error copy, site-wide progress bar, pricing table rebuild

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

Three user-reported frontend issues (`docs/web/frontend-issues-audit.md` P2 batch):

1. The chat widget opened at the top-left overlapping the header instead of anchored above its
   launcher. The native `<dialog>` UA stylesheet applies `inset: 0`; the utility classes only set
   `bottom-20 right-5`, so the over-constrained box resolved `top: 0; left: 0`.
2. A backend failure surfaced raw `Upstream error: 402` inside the chat bubble - a provider-
   facing string in user-facing copy.
3. The pricing ComparisonTable rendered with the header detached from the body: the header row sat
   over empty columns while the body rows only spanned the left portion of the table.

### The decision

- **Chat dialog** (`ChatWidget.tsx`): the `<dialog>` className now sets `top-auto left-auto`
  alongside `bottom-20 right-5`, so the box anchors bottom-right above the launcher
  (`right: 24px`, `bottom: 96px`) instead of at the viewport origin. Backend `error` events map to
  the friendly `CHAT_COPY.error` message; the raw provider text goes to `console.error` only.
- **Progress bar** (`ReadingProgress.tsx`): the bar sits **below** the fixed header at
  `top-16 sm:top-[4.5rem]` and is mounted once, site-wide, from `layout.tsx` right after
  `<Header>`; the per-article mount was removed.
- **Pricing table** (`ComparisonTable.tsx`): the real root cause was invalid HTML - `GroupRows`
  rendered a `<tbody>` per feature group inside the parent `<tbody>` (nested row groups). The SSR
  HTML parser auto-closes the outer `<tbody>` at the first inner one, producing **8 sibling
  `<tbody>` elements**; in `table-layout: fixed`, Chrome gives each row group its own column grid,
  so the thead columns (288/261/261/261, from `w-72` + equal split) never propagated to the body
  rows, which collapsed to their own 520px content grid. `GroupRows` now renders a Fragment, so
  there is a single `<tbody>` and every row shares the thead grid (verified 288/261/261/261 in
  header, group labels, and all 37 data rows). The table also uses `table-fixed border-separate
  border-spacing-0` with `w-72` on the Feature column; at ≥1024px it no longer overflows, so no
  edge-fade hint is shown.

### How to work with this

- Never nest a `<tbody>` inside another `<tbody>` in SSR'd tables - the HTML parser splits them
  into sibling row groups and Chrome's fixed table layout then gives each group its own column
  grid, silently desyncing header and body. One `<thead>` + one `<tbody>`, with row-group headers
  as ordinary `tr`s inside it, is the reliable pattern.
- Chat error handling: the visible bubble only ever shows `CHAT_COPY.error`; raw provider messages
  are console-only. The verify script clears `localStorage` before chat assertions and isolates
  Chrome profiles per port.
- The progress bar is a single site-wide instance; do not mount a second one on article pages.

### Consequences

- `check:facts` and lint still pass; the build is 24/24 static pages. The `/pricing` matrix has no
  page-level horizontal overflow at ≥1024px and the mobile cards layout (37 cards at 390px) is
  unaffected.
- Chat answers remain unverifiable end-to-end while the OpenRouter quota is out (backend
  `/api/chat` returns `Upstream error: 402`); the dialog UI and error path are verified.
- The `/tmp/opencode/verify-fixes2.mjs` matrix is 5/5 (progress bar, chat anchor, group-label
  full-width geometry, colspan attr, mobile cards).

### References

- `apps/web/frontend/src/components/chat/ChatWidget.tsx`
- `apps/web/frontend/src/components/blog/ReadingProgress.tsx`
- `apps/web/frontend/src/app/layout.tsx`
- `apps/web/frontend/src/components/pricing/ComparisonTable.tsx`
- `docs/web/frontend-issues-audit.md` - P2 batch (chat widget, progress bar, pricing table)

---

## D-009 — Chat widget: backdrop-click close restores the launcher toggle

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

After D-008, the chat launcher would not close the dialog: pressing the chatbot icon (which swaps
to a close icon while open) did nothing. `showModal()` puts the `<dialog>` in the top layer, so its
`::backdrop` covers the launcher button (`fixed bottom-5 right-5 z-chat`) regardless of z-index -
the button is not hit-testable while the dialog is open. Synthetic `el.click()` tests masked this
because they dispatch directly to the element, bypassing hit-testing; a real mouse press at the
launcher coordinates hit the backdrop instead.

### The decision

Close the dialog on backdrop clicks. The `<dialog>` gained an `onClick` that calls `close()` when
`event.target === event.currentTarget` - clicks on `::backdrop` target the dialog element itself,
while clicks on the header/body/footer land on their children, so content interactions never close
it. This restores the toggle's muscle-memory behavior: pressing where the launcher sits (over the
dimmed backdrop) closes the chat, and the header X already worked.

### How to work with this

- Do not rely on `element.click()` in tests for top-layer UI - a real user's press is governed by
  hit-testing, so `Input.dispatchMouseEvent` (or `elementsFromPoint`) is the honest check.
- A modal `<dialog>` always covers fixed widgets outside it; if an external control must stay
  interactive while open, move it inside the dialog or use a non-modal `show()`.
- Escape-close is native for modal dialogs (`cancel` then `close`); keep `onClose` syncing the
  `open` state.

### Consequences

- Real-click verification: open via launcher, close via launcher-position (backdrop) click, close
  via header X, click-inside stays open, Escape closes (native `cancel` fires once).
- No copy/facts impact; lint and build pass.

### References

- `apps/web/frontend/src/components/chat/ChatWidget.tsx`
- D-008 (chat dialog positioning + error copy)

---

## D-010 — Chat widget lifecycle: DOM-derived toggle + close on route change

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

Two residual chat-state defects after D-008/D-009:

1. **Launcher/panel state could desync.** The launcher toggled from React `open` state. If `onClose`
   never fired (e.g. focus moved before the close event, or the dialog was closed through a path that
   skipped `setOpen(false)`), the state went stale: `open === true` but the dialog was actually
   closed, so `close()` became a no-op and the launcher froze showing the close icon - "focus shifts
   but the UI does not appear".
2. **The modal dialog survived client-side navigation.** `ChatWidget` lives in `layout.tsx`, so a
   soft navigation (clicking a nav link) does not unmount it, and a top-layer modal `dialog` stays
   open across the route change. The user lands on the next page with the chat panel already open -
   reported verbatim as "the panel opens at the start of the webpage and never disappears".

### The decision

- `toggle()` now derives its branch from the **actual dialog DOM** (`dialogRef.current?.open`) instead
  of the cached React state, and `close()` writes state back synchronously
  (`dialogRef.current?.close(); setOpen(false)`), wrapped in try/catch so no throw can leave the
  state desynced.
- The widget subscribes to `usePathname()`; when the pathname changes, the dialog is closed. The
  chat panel can no longer ride along to a new page, so no page ever starts with it open.

### How to work with this

- Trust the DOM, not the state mirror: for top-layer widgets, the source of truth for "is it open?"
  is the element's own `open`/`open`-attribute, and the React state is a projection of it.
- Any behavior that must not persist across routes belongs to a layout-level component like this;
  `usePathname` is the cheap, correct signal for "the user navigated".
- Route-change close also makes a real-user close failure easy to distinguish from a cache problem:
  if a freshly hard-refreshed page still fails to close, the served bundle is stale, not the code.

### Consequences

- Verified headlessly with real CDP mouse clicks: open/close/backdrop/Escape 8/8; soft-nav now shows
  `open: false` on the destination page; pricing regression matrix 5/5; lint + `check:facts` + build
  pass.
- No copy/facts impact.

### References

- `apps/web/frontend/src/components/chat/ChatWidget.tsx`
- D-009 (backdrop-click close), D-008 (dialog positioning)

---

## D-011 — Elevation: flat by default, shadow only on lifted objects

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

Remove resting card/band shadows site-wide (audit §14). Only the four hero lifted objects
(home Hero, PricingHero, WhyHero, Methodology scorecard, all at 0.45 alpha) and floating UI
(mega-menu sheet, chat FAB/dialog, FAQ search sheet) keep shadows. Tilt/spotlight stay as
hover-interaction depth — removing the resting shadow makes them read as interaction, not
default. Supersedes the shadow portion of P2 D-004/D-006.

### How to work with this

- New cards/bands default to border + hairline, no `shadow-*`.
- The only resting shadows allowed are the four `shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)]`
  hero objects and the `menu-float` token
  (`0 20px 25px -5px rgb(27 67 50 / 0.10), 0 8px 10px -6px rgb(27 67 50 / 0.10)`).
- `rg "shadow-\[0_28px" src` must return exactly 4 results.

### References

- `docs/web/p3-execution-plan.md` WS-19; `docs/web/frontend-issues-audit.md` §14

---

## D-012 — Elevation shadows: keep mega-menu float

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

The mega-menu sheet is floating UI, so it keeps a shadow — but the P2 `shadow-xl
shadow-primary-deep/10` default is replaced with the design.json `menu-float` token
(`0 20px 25px -5px rgb(27 67 50 / 0.10), 0 8px 10px -6px rgb(27 67 50 / 0.10)`), applied via
arbitrary Tailwind syntax.

### How to work with this

- Floating panels (menus, chat, search sheets) use `menu-float`; cards never use it.

### References

- `docs/web/p3-execution-plan.md` WS-19

---

## D-013 — Motion: one reveal helper + quint easing

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

`EASE` becomes `cubic-bezier(0.22, 1, 0.36, 1)` (design.json `ease-out-quint`) and a shared
`REVEAL` const (y 24→0, 700 ms) is added to `lib/motion.ts`. Generic section heading/lead
entrances in P3-touched components (Outcomes, FieldReports, Roi) use `REVEAL`. Signature
choreography is exempt from retiming: hero wipes, in-list staggers (0.06–0.14 s), the
Methodology score counter, Roi scrub draw, and chat/pulse loops.

### How to work with this

- New entrances: `gsap.fromTo(el, REVEAL.from, REVEAL.to)`.
- Leave signature sequences on their existing timings; don't retrofit `REVEAL` everywhere.

### References

- `docs/web/p3-execution-plan.md` WS-20; `apps/web/frontend/src/lib/motion.ts`

---

## D-014 — Field reports: collapse prose only

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

In `case-studies/FieldReports.tsx`, only the challenge/solution prose collapses into native
`<details>` (first report open by default). Stat strips, results lists, quotes, and metadata
stay always visible — this is the evidence page and must not read as identical card grids.

### How to work with this

- Use native `<details>`/`<summary>` with `list-none` + `[&::-webkit-details-marker]:hidden`
  and the `ChevronIcon` rotate pattern (PricingFaq).
- Never collapse the stat/result/quote content.

### References

- `docs/web/p3-execution-plan.md` WS-21; `docs/web/frontend-issues-audit.md` §12

---

## D-015 — Roi: quantified field-evidence strip

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

`Roi.tsx` gains a labeled "Field evidence" strip — 60% fewer status-check meetings · 18% less
overtime · 28,000 USD saved annually — grounded in `content/pages/case-studies.md`. The strip is
deliberately NOT bolted onto the three qualitative ROI claims (that would fabricate causality).
The 28,000 figure is written without a `$` prefix so the `prices` subset rule does not fire.

### How to work with this

- The three figures must stay corpus-grounded; `check-facts` `case-study-stats` now also gates
  `/18%/` and `/28,000/`.

### References

- `docs/web/p3-execution-plan.md` WS-22

---

## D-016 — Social share images: build-time PNG via next/og

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The decision

OG images are generated at build time with `ImageResponse` — root `opengraph-image.tsx` (site
default) and `resources/[slug]/opengraph-image.tsx` (per-essay title). Twitter card →
`summary_large_image`. Fonts are committed subset TTFs under `src/assets/fonts/` (Spectral 600,
Figtree 400/600; OFL). The route reads fonts with `fs.readFileSync` at build (statically
prerendered) because the `new URL(..., import.meta.url)` fetch pattern rewrites to a
host-relative static path that `fetch` cannot parse during prerender, and because satori
rejects woff2 and variable fonts (`gvar`/`fvar` must be stripped).

### How to work with this

- satori accepts TTF/OTF/WOFF only — never commit woff2 here.
- New OG images: static TTF fonts, `generateStaticParams` for param'd routes, PNG 1200×630.

### References

- `docs/web/p3-execution-plan.md` WS-23/24; `docs/web/frontend-issues-audit.md` §13

---

## D-007 — Punctuation policy: no em/en dashes in frontend copy

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

The P2 dash sweep (WS-17, `docs/web/frontend-issues-audit.md` §13-P2) found 202 em/en dashes
across `frontend/src/`. Typographic dashes are a lint-blind spot, and they interact badly with the
`check:facts` pricing gate: `$1`-style capture replacement strings in `src/` get flagged as price
literals, so a dash-handling regex could silently corrupt a price comparison. There was no rule
telling writers which character to use where.

### The decision

Frontend copy uses **no `—` or `–`**:

- Numeric ranges → plain hyphen (`0-100`, `1-60`, `10-200`).
- Prose separators / asides → spaced hyphen `" - "`.
- Parenthetical interrupter clauses → real parentheses.

`check:facts` price/size rules are dash-tolerant (`(?:-|–|—)`) so the same facts survive in both
channels; the sweep removed all 202 occurrences (verified `rg -o '—|–' src | wc -l` → 0).

### How to work with this

Never type `—` or `–` in `src/` or `content/`. When a sentence needs a break, prefer parentheses
or `" - "`. Numeric ranges are always hyphen-minus. When editing a dash-tolerant `check:facts`
rule, never use `$1` capture replacement strings in `src/` — use a function replacer.

### References

- `docs/web/frontend-issues-audit.md` §13-P2 — the sweep requirement
- `apps/web/frontend/scripts/check-facts.mjs` — dash-tolerant rules

---

## D-006 — FAQ rebuild: client search + native `<details>` accordions + FAQPage JSON-LD

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

The previous `/faq` was a flat list — no way to search, no anchor navigation between categories, no
structured data, and each Q&A rendered as always-open content that made the page long and hard to
scan.

### The decision

Rebuild `/faq` as (a) a client-side search box over the corpus-derived FAQ data, (b) category
anchor sections with jump links, (c) **native `<details>/<summary>` accordions** — chosen over a
controlled React accordion because the platform gives keyboard handling, screen-reader semantics,
and open/close behavior for free and the page still works with JS disabled, (d) `FAQPage` JSON-LD
for rich results, and (e) a live region announcing filter results to assistive tech.

### How to work with this

Keep accordions as native `<details>`; do not swap in a state-managed accordion component without
re-checking the no-JS and a11y behavior. Adding a Q&A means editing the corpus markdown and the FAQ
data together, then re-running the anchor-parity check against the built HTML.

### References

- `apps/web/frontend/src/app/faq/page.tsx` — rebuild site
- WS-10 in `docs/web/p2-execution-plan.md`; WS-16 anchor-parity gate

---

## D-005 — Table overflow affordance: TableScroll wrapper + edge fade (+ `min-w-0`)

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

Six wide tables (`pricing/ComparisonTable`, `home/Plans`, compliance retention + security, contact
support-ledger, article/FAQ body renderers) overflow the viewport on small screens. Shrinking them
made columns unreadable and degraded sticky-header behavior. Independently, tables inside
flex/grid cards refused to shrink below their `min-w-[…]`, blowing the page width — the
`/contact-us` page at 360px showed `scrollW=502` (a real horizontal-overflow bug).

### The decision

Introduce a shared `TableScroll` component that wraps overflowing tables in an `overflow-x-auto`
container with gradient **edge-fade** masks and a scroll hint, preserving native horizontal scroll,
sticky headers, and sticky first columns. Wrapping cards get `min-w-0` on their flex/grid children
(`js-contact-col`, `js-ledger-col`) so they can shrink to the viewport instead of forcing the page
wide. These tables are **never** tilt targets (see D-004).

### How to work with this

Any new wide table uses `TableScroll`. If a table lives inside a card, give the card's flex/grid
child `min-w-0`; do not remove a table's `min-w-*` as a "fix" — the scroll wrapper is the
affordance.

### References

- `apps/web/frontend/src/components/TableScroll.tsx`
- `apps/web/frontend/src/components/contact/ContactSection.tsx`, `apps/web/frontend/src/app/contact-us/page.tsx` — `min-w-0` fixes
- WS-8 in `docs/web/p2-execution-plan.md`

---

## D-004 — D-6 amended omission set: tilt/spotlight omits ComparisonTable only

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web` · **Supersedes:** the wider D-6 omission carve-out for every surface except ComparisonTable

### The problem

Audit D-6 (`docs/web/frontend-issues-audit.md` §16.1) originally omitted tilt on the pricing
`ComparisonTable` **and** wide/overflowing tables **and** interactive/full-width conversion
surfaces. Applied literally during WS-9, that blanket carve-out would strip the effect from every
other tier card purely because the page also contains wide tables — leaving cards without the
feedback the pattern was invented for.

### The decision

Amend the D-6 omission list to **exactly one surface: `pricing/ComparisonTable`**. Every other
tier card receives tilt/spotlight (TiltCard + tiered rollout). Overflowing tables receive the
`TableScroll` scroll+edge-fade affordance (D-005) instead — a different mechanism for a different
problem, so no conflict remains.

### How to work with this

A future comparison matrix wider than the viewport follows ComparisonTable's exclusion precedent:
scroll affordance, no tilt. Any other card that matches an effect role (D-003) may use the effect.

### References

- `docs/web/frontend-issues-audit.md` §16.1 (D-6) — original omission set
- `apps/web/frontend/src/components/TiltCard.tsx` + tiered rollout (WS-9)

---

## D-003 — Effect policy: restrained motion for a compliance brand

**Status:** Accepted · **Date:** 2026-08-06 · **Scope:** `apps/web`

### The problem

The site had one bespoke tilt/spotlight pattern (`ComparisonLedger`) and no vocabulary for how
effects should spread. Without a rule, motion grows ad hoc — everything tilts, or nothing does —
which reads as gimmicky and undercuts the calm, trust-first tone a compliance brand must keep.

### The decision

Adopt the audit's effect grammar as a site-wide rule (WS-9):

- **magnetic** = primary CTAs (PlanSummary)
- **spotlight** = dark-surfaced evidence panels (Methodology inner/card spotlight, band spotlight)
- **tilt** = at most one lifted card per page (ComparisonLedger / TiltCard)
- **nudge** = narrative/contrarian cards (FalseChoice)

All effects are gated by `{motion, hover}` and capped (tilt `maxAngle: 2`). Restraint is the
default; effects are opt-in per component, never site-wide.

### How to work with this

A new card gets an effect only if it matches one of the roles above — and never tilt a
horizontally-scrolling table (D-004/D-005). When in doubt, ship the card without an effect.

### References

- `docs/web/frontend-issues-audit.md` §16.1 — effect policy rule and usage alignment
- WS-9 in `docs/web/p2-execution-plan.md`

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
