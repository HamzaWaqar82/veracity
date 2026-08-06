# Design system — Veracity marketing site (apps/web/frontend)

Design decisions that are easy to unknowingly regress. Read before editing visuals, copy, or motion.

## Tokens

Single source: `src/app/globals.css` (`@theme inline`). Tailwind v4 color utilities reference these CSS variables; do not hard-code hex/oklch in components.

- Light-only, warm-white surfaces: `bg` (pure white), `surface`, `surface-deep`.
- Green ramp pinned at hue ~161: `primary`, `primary-deep`, `primary-soft`, `pine`, `mint`.
- Accent is cool teal (`~205`) — the "verification voice" (never/refusal glyphs, dispute workflows). Green + teal are the two semantic poles.
- Dark surfaces (`primary-deep`) use `on-dark*` text tokens.

### Activity-state colors are a closed set of four

`state-active` (mint 161) · `state-passive` (blue 225) · `state-idle` (gray-green 160) · `state-private` (gold-amber 82).

**One deliberate exception:** the scoring category `unproductive` uses `--color-unproductive` (rust, hue ~42). It is a *scored, full-weight* negative category, so it must stay visually distinct from PRIVATE_TIME amber (which means "excluded entirely"). If a new scored category is added, prefer reusing an existing token over adding a sixth color.

## Contrast (WCAG AA)

Measured with an OKLCh→sRGB→relative-luminance conversion (verified against the hex comments in `globals.css`):

- `hero-muted` on `mint` = **5.2:1** (passes 4.5:1 — do not darken).
- `hero-ink` on `mint` = **7.9:1**.
- `muted` on `bg` = **7.4:1**; `muted` on `surface` = **6.5:1**.
- `on-dark-muted` on `primary-deep` ≈ **6.5:1**.

`hero-line` / `line` / `on-dark-line` are decorative hairlines — they are not text and carry no AA requirement.

## Typography

- Display: Spectral (serif), `font-display`. Sans: Figtree, `font-sans`.
- Headings: display, weight 600, `tracking-[-0.02em]`, `text-wrap: balance`. Paragraphs: `text-wrap: pretty`.
- **The micro-scale is deliberate, not a mistake:** chips/labels `0.6875rem` (11px, uppercase small-caps), secondary text `0.8125rem` (13px), body `0.9375rem` (15px), lede `text-lg` (18px). Keep this hierarchy on new UI; do not "fix" 11px/13px to be larger.

## Motion

Rules that keep the site from turning into a slideshow:

1. **One signature scene per page.** The hero artifact (below) gets the full choreography. Everything else is a single enter-reveal (`autoAlpha` + a small `y`), never a second pinned scrub.
2. **No scroll pins or scroll-choreography.** Comparison tables and ledgers reveal on enter; rows stagger once. Hover-highlight (CSS) carries the interactivity. The pinned "scroll to compare" behavior was deliberately removed (critique P1-4) — do not reintroduce `pin: true` / `scrub` timelines on data tables.
3. **Tilt/spotlight only on featured panels** (hero artifacts, the comparison ledger card, final CTA, "What we never do"). Do not add `attachTilt`/`attachSpotlight` to repeat-scene cards (States, Approach, Methodology) — that was removed in P1-6.
4. All motion is gated by `MOTION` (prefers-reduced-motion) via `gsap.matchMedia`; cursor effects also gate on `HOVER`. GSAP sets/clears `will-change` inline during tweens — keep the CSS `will-change` hint list minimal (persistent transforms only, see `globals.css`).
5. Icons draw in with `js-draw` (strokeDashoffset) — fine as part of an enter timeline, not tied to scroll position.

### Hero system (four pages, four artifacts)

Shared rhythm (badge pill → word-stagger headline → lede → CTAs → trust line) is intentional. Each hero carries a distinct artifact — preserve it:

- Home: asymmetric split, live state-panel.
- Features: centered spec-sheet + scrollspy jump nav.
- Pricing: centered + `PRICE QUOTE` receipt card + jump nav.
- Why: centered + comparison-ledger stub + scrollspy jump nav.

CTA on every hero is **"Get Early Access"** → `/early-access`. Do not reintroduce trial-labels ("Start Free Trial") that contradict the at-launch trial.

## Copy & facts

- `src/components/**` copy is a **non-contradicting subset** of the corpus (`apps/web/content/`). Shorter, never different.
- `npm run check:facts` gates the build — prices, trial terms, plan limits, compliance statutes, capture scope, never-list, fit, and case-study stats are checked frontend-vs-corpus. Run it after any copy change.
- **Pricing is repeated on 8+ surfaces** (home `Plans`, `/pricing` matrix, billing entries, FAQ, feature tier badges, early-access, heroes' trust lines, `page.tsx` metadata/JSON-LD). A price/limit/trial change must update **the corpus first**, then every surface — the `check:facts` rules (prices, trial-duration, no-credit-card, screenshot-intervals, api-limits, …) exist to catch drift.
- **No named customers or fabricated social proof.** Customer evidence is role-attributed ("Operations lead, remote software team · early design partner") and must exist in the corpus. Named case studies (Luminate/Helios) are corpus-side only until content governance retires them.
- "What we never do" is a hard-refusal list; roadmap/deferred items (HRIS/SCIM) live in the separate "Deferred, not refused" block, not in the signed refusal list.
- **The never-guarantee strip is the footer's four-item line** ("No keystrokes. No video. No stealth. No emotion AI." — verbatim from `PRODUCT.md`, §5). Any shorter never-line elsewhere (e.g. the home hero badge "No stealth mode") is a compatible subset of these four and must never introduce a fifth exclusion; prefer the canonical four when adding new never-copy.

## Governance

- Decision log: `DECISIONS.md` (content model, D-001). This file complements it for visual/motion/copy standards.
- Any PR touching retrieval logic must state eval scores before/after (per `apps/web/AGENTS.md`).
