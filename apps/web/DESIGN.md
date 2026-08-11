---
name: Veracity Website
description: Workforce Analytics Built on Trust, Not Surveillance
colors:
  primary: "#2D6A4F"
  primary-deep: "#1B4332"
  primary-soft: "#D8F3DC"
  pine: "#40916C"
  mint: "#B7E4C7"
  accent: "#005A63"
  accent-soft: "#D5EFF2"
  bg: "#FFFFFF"
  surface: "#E7F4EA"
  surface-deep: "#DAEEDE"
  ink: "#081C15"
  muted: "#4C5953"
  line: "#C7DCCE"
  hero-ink: "#1B4332"
  hero-muted: "#4C5953"
  hero-line: "#74C69D"
  hero-panel: "#FBFEFC"
  on-dark: "#D8F3DC"
  on-dark-muted: "#A4D1B5"
  on-dark-line: "#375F4C"
  state-active: "#52B788"
  state-passive: "#007EA2"
  state-idle: "#52665B"
  state-private: "#AA7E1A"
typography:
  display:
    fontFamily: "Spectral, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.75rem, 4vw + 2rem, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Spectral, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.875rem, 2vw + 1.25rem, 3rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Spectral, Georgia, 'Times New Roman', serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.16em"
    textTransform: "uppercase"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  full: "9999px"
spacing:
  section: "clamp(4.5rem, 11vw, 8rem)"
  section-sm: "clamp(3rem, 7vw, 5rem)"
  xl: "3.5rem"
  lg: "2.5rem"
  md: "1.5rem"
  sm: "1.25rem"
  container: "max-w-6xl px-5 sm:px-8"
components:
  btn-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    typography: "{typography.label}"
  btn-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  btn-inverse:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  btn-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  chip:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  nav-link:
    textColor: "{colors.muted}"
    fontSize: "0.875rem"
    fontWeight: 500
---

# Design System: Veracity Website

## 1. Overview

**Creative North Star: "The Open Ledger"** — every claim on the page is a verifiable entry, the way the product's acknowledgment ledger makes capture state verifiable. The interface should feel like evidence, not marketing: calm, specific, and honest enough to state where the product does not fit.

The register is brand — the design IS the product. Personality is **trustworthy, precise, humane**, and the emotional goal is the combined strategy: calm confidence (the relief of "we can stop guessing"), clear-eyed reassurance (someone finally explains monitoring without fear-mongering), and principled conviction (a brand with backbone, on the employee's side).

The palette strategy is **Committed Fresh Greens**: a fresh mint hero band carries the brand color, the page body is restrained near-monochrome with green reserved for action, capture, and verification, and the footer + final CTA land on drenched pine as the bookend. Typography pairs a **serif display (Spectral) with a sans body (Figtree)** — editorial trust in the headlines, precise legibility in the prose. Motion is **responsive with light choreography**: state feedback and transitions at rest, and exactly two moving parts — a restrained Verification Teal cursor ring (fine-pointer devices only) and scroll-revealed sections — gated behind `prefers-reduced-motion`, which resolves to static, fully-readable pages. Depth is **flat by default**; two shadows are reserved for floating surfaces: the ledger panel as the hero's "lifted object" and the mega-menu panel as the nav's floating sheet.

This system explicitly rejects four aesthetic families — all four appear verbatim as Don'ts in Section 6: the generic AI/SaaS template, the surveillance/enterprise-tool dashboard, the dark cyber/hacker look, and the corporate brochure.

**Key Characteristics:**
- Light, open, trustworthy surfaces; the green is committed where it speaks (hero, CTA, footer), rare where it would decorate
- Evidence over spectacle — specificity is the visual texture (exact idle thresholds, exact capture intervals, exact pricing)
- Serif display carries humane editorial warmth; sans body carries precision
- Flat by default; depth appears only as floating UI — the ledger panel and the mega-menu sheet
- Honest empty states and refusal as a feature, not a bug

## 2. Colors: The Fresh Greens Ledger

A two-strategy bookend on a pure-white ledger: **Celadon mint** opens the page, **Pine Teal** closes it, and between them the greens are semantic — action, capture, verification, state — never decoration.

### Primary
- **Hunter Green** (#2D6A4F / `oklch(0.476 0.078 162)`): buttons, links, checkmarks, plan prices, active states. 6.39:1 on white — always the same green, never a darker "hover-only" surprise.
- **Pine Teal** (#1B4332 / `oklch(0.348 0.055 163)`): the deep bookend. Footer background, final CTA panel, ledger header bar, primary-button hover.
- **Frosted Mint** (#D8F3DC / `oklch(0.938 0.042 150)`): chips, tints, callout panels, and the ledger's "Signed · server-verified" strip.
- **Celadon Mint** (#B7E4C7 / `oklch(0.879 0.061 157)`): the hero band itself; also secondary on-dark text.
- **Sea Green** (#40916C / `oklch(0.596 0.098 161)`): icon green — checkmarks and compliance bullets, never buttons.

### Secondary
- **Verification Teal** (#005A63 / `oklch(0.42 0.085 205)`): the accent voice. A cool teal, deliberately off-green, used for the "never captures" minus-icons, focus rings, and semantic counter-evidence. Its coolness contrasts the warm greens so capture ("yes") and refusal ("never") never read as the same action.

### Neutral
- **Pure White** (#FFFFFF / `oklch(1 0 0)`): page background and every card. Not cream, not sand — the sheet of paper the ledger is written on.
- **Carbon Black** (#081C15 / `oklch(0.207 0.03 168)`): all text — body and headings. 17.7:1 on white.
- **Frosted Surface** (#E7F4EA / `oklch(0.955 0.02 152)`): alternating light-mint section bands (Approach, How It Works, Plans, Testimonials).
- **Celadon Hairline** (#C7DCCE / `oklch(0.875 0.03 157)`): all borders and dividers, plus table rules.
- **Muted** (#4C5953 / `oklch(0.45 0.018 165)`): secondary text. A true neutral gray-green (6.9:1 on white), so green is reserved for semantic moments — actions, prices, checks, state dots — and the Two-Voice system keeps its contrast power.

### Named Rules
**The Committed Rule.** The Fresh Greens ramp owns the hero band, the final CTA, and the footer. On the page body, green is semantic — action, capture, verification, state — never decoration.

**The Two-Voice Rule.** Capture and refusal must never share a color. Affirmations (what Veracity captures) use green; refusals (what it never captures) use the cool Verification Teal. The employee must be able to tell "yes" from "no" at a glance.

**The On-Dark Rule.** On pine surfaces, text is Frosted Mint (or Celadon for secondary); hairlines are Pine hairline #375F4C. Never reuse light-surface tokens (ink, line) on pine — they disappear.

## 3. Typography

**Display Font:** Spectral (500/600, with Georgia / Times New Roman / serif fallback)
**Body Font:** Figtree (400–700, with ui-sans-serif / system-ui / Segoe UI fallback)
**Label/Mono Font:** Figtree Bold, uppercase (no mono; metadata is tracked, not "code")

**Character:** The serif display carries trust, permanence, and humane editorial warmth — the opposite of a surveillance tool's cold UI font. The sans body carries precision and legibility for specification-grade prose. Headlines are set with tight tracking and balanced wrapping; body copy stays quiet so the specificity of the claims does the talking.

### Hierarchy
- **Display** (600, `clamp(2.75rem, 4vw + 2rem, 4.5rem)`, 1.04, -0.03em): Hero statement only. Letter-spacing never looser than -0.03em at this size; `text-wrap: balance`. Ceiling 4.5rem — never larger.
- **Headline** (600, `clamp(1.875rem, 2vw + 1.25rem, 3rem)`, 1.2, -0.02em): Section headings (text-3xl → 4xl → 5xl). Balanced wrap, `max-w-3xl` where the heading stands alone.
- **Title** (600, 1.5rem, 1.3): Card and component titles — ledger rows, capture card heads, component names.
- **Body** (400, 1rem / 0.9375rem on cards, 1.625): Prose at 65–75ch line length, `text-wrap: pretty`. Ledes use text-lg (1.125rem). Verified ≥ 4.5:1 everywhere, including secondary text.
- **Label** (700, 0.8125rem, 0.16em tracking, uppercase): Metadata, timestamps, ledger headers ("OPEN LEDGER", "ACTIVE"), state names. Uppercase labels are used as ledger/evidence markers — never as an eyebrow on every section.

### Named Rules
**The Ledger Label Rule.** Uppercase tracked labels are evidence markers — state names, ledger headers, "Signed · server-verified". Prohibited as a per-section eyebrow; that is the generic-SaaS tic this system rejects.

## 4. Elevation

Flat by default; depth is conveyed through tonal layering and hairlines, not shadows. Section bands alternate white and Frosted Surface; cards are white on the band; dividers are 1px Celadon hairlines. Shadows exist in exactly two places, both floating surfaces: the ledger panel, the one piece of the product the visitor is asked to believe in (it sits slightly off the page), and the mega-menu panel, which floats over page content and needs separation to read as a dropdown sheet. Nothing else lifts.

### Shadow Vocabulary
- **ledger-lift** (`box-shadow: 0 28px 60px -28px rgba(27, 67, 50, 0.45)`): The ledger panel only. A wide, soft, pine-tinted drop that reads as depth, not glow. Never reused on cards, buttons, or the capture card.
- **menu-float** (`box-shadow: 0 20px 25px -5px rgb(27 67 50 / 0.10), 0 8px 10px -6px rgb(27 67 50 / 0.10)`): The mega-menu panel only. A tight, low pine-tint float that separates the sheet from the page beneath. Never reused on cards, buttons, or the ledger.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows signal floating UI (dropdown sheet, the single lifted object) — never cards, buttons, or section bands.

**The Focus Ring Rule.** `:focus-visible` is a 2px Verification Teal outline, 3px offset, 4px radius. Keyboard focus is always teal-on-white — the same two-voice color that signals "no" in the copy. Never a green ring: focus must not be confused with a positive action.

## 5. Components

### Buttons
- **Shape:** Fully rounded pills (9999px). Buttons are the only place a fully rounded edge is used — it reads "action" against the quiet 24px card corners.
- **Primary (Hunter Green, white text, 12px 24px padding):** "Start Free Trial" and every primary action. Hover deepens to Pine Teal (`transition-colors duration-200`) — the background changes, never the text.
- **Inverse (white pill, Pine Teal text):** The primary CTA on the pine final-CTA panel — the only white surface on the deep green.
- **Outline (1px Celadon hairline, Carbon Black text):** Secondary actions ("View Pricing" on the body); hover darkens the border to ink and fills with Frosted Surface.
- **Outline-Hero (1px Mint-Leaf hairline, Pine Teal text):** The outline variant on the mint hero band; hover darkens to hero-ink and tints white/40.
- **Hover / Focus:** 200ms color transition; focus ring per the Focus Ring Rule. Disabled never appears — the page has no dead buttons.

### Chips
- **Style:** Fully rounded (9999px), Celadon hairline border, 1px; plain chips are Frosted Surface with Carbon Black text; semantic chips (plan prices, principle callouts) are Frosted Mint with Hunter Green text at 13px semibold.
- **State:** Static evidence tags — "app · url", "meeting", "not scored". A green Frosted Mint chip signals a positive guarantee; a plain chip is neutral metadata. No hover, no selection — chips assert, they don't filter.

### Cards / Containers
- **Corner Style:** 24px radius for large containers (capture card, final CTA panel); 16px for the ledger panel and the states grid; 12px for inline callouts.
- **Background:** Pure white cards on Frosted Surface bands; the capture card and states grid sit on white with hairline borders.
- **Shadow Strategy:** Flat, per the Flat-By-Default Rule; only the ledger panel carries `ledger-lift`.
- **Border:** 1px Celadon hairline for every card edge and table.
- **Internal Padding:** 28px on mobile → 36px on desktop for cards; 20px rows inside the ledger; 24px cells in the plans table.

### Navigation
- **Header:** Fixed, transparent over the mint hero, switching to `bg-bg/95` with a hairline once scrolled past 16px. Wordmark is Spectral 20px semibold; links are Figtree 14px medium in hero-muted (over mint) or muted (over white), darkening to ink on hover. CTA is the primary pill (white pill while over mint).
- **Desktop mega menu:** Features, Pricing, Why Veracity, and Blog each open a hover-activated panel (180ms close delay, keyboard `focusin` opens, Escape closes and returns focus to the trigger, chevron carries `aria-expanded`/`aria-controls`). Panels are uniform width — `w-[min(46rem,calc(100vw-2.5rem))]`, centered under the trigger — 24px radius, white, 1px Celadon hairline, `menu-float` shadow. Multi-column panels grid 3 across (`sm:grid-cols-2` → `lg:grid-cols-3`); single-column items (Pricing, Blog) spread their links evenly across the same three cells so every panel is the same size. Column headings are uppercase Ledger Labels; the CTA row sits under a hairline divider in primary.
- **Mobile:** A full-screen native `<dialog>` — white surface, Pine Teal backdrop at 40%. Links become Spectral display-size rows (30px → 36px) divided by hairlines; mega-menu children flatten into grouped lists under each top-level item; the primary CTA is full-width at the bottom with "14-day free trial · No credit card" beneath.

### The CTA Slot
- **One job: convert.** The hero CTA slot holds exactly two buttons: the page's conversion action (primary) and its alternative (secondary). Never a third, never decorative.
- **Secondary role by page type:** on pre-funnel pages (home, why, features) the secondary is the transparency path — "See Pricing" / "Compare plans" → `/pricing`; on conversion pages (trial, demo, contact) it is the alternative human path — "Request a demo" / "Book a live demo instead" / "Start Free Trial"; on editorial/index pages (about, case studies, integrations) section anchors are acceptable in both slots.
- **Illegal in the CTA slot:** an in-page jump on any page that has a real conversion CTA (jumps belong to jump-nav/TOC), a link to the same page, or a rhetorical "X, not Y" label. The secondary label is a verb phrase, never a negation.
- **Badge copy:** hero badges state what the page is ("Employee-visible monitoring", "Published pricing · Exact at every tier") — never "No X" claims. Factual guarantees ("No credit card", "No seat minimum") are allowed only as concrete trial terms in note strips, never in the badge itself. One strong negative claim per site: the home tagline.

### Signature Component — The Ledger Panel
The hero's evidence artifact: a 16px-radius near-white card with a **Pine Teal header bar** reading "OPEN LEDGER" and a pulsing state-active dot beside "LIVE · HEARTBEAT 60s". Body rows show each activity state (ACTIVE, PASSIVE, IDLE, PRIVATE_TIME) as a colored dot + uppercase state label + caption + a chip tag. The footer strip is Frosted Mint with Hunter Green text: "Signed · server-verified" / "No data hidden from employees". A 1px Mint-Leaf hairline frame floats 12px behind the card. It sits under the `ledger-lift` shadow — the one lifted object on the page.

### Signature Component — The Cursor Ring
A 28px, 1.5px Verification Teal ring that trails the pointer using GSAP `quickTo` (0.45s `power3.out` on x/y, 0.35s on scale). It activates only on fine-pointer devices — `(hover: hover) and (pointer: fine)` AND `prefers-reduced-motion: no-preference` via `gsap.matchMedia()` — and is `aria-hidden` with `display: none` at rest, so it never intercepts input, never triggers on touch, and never replaces the native cursor or a `:focus-visible` ring. It scales to 1.6× over interactive elements (`a, button, [role=button], [data-cursor]`), fades out when the pointer leaves the window, and sits at z-index 80.

## 6. Do's and Don'ts

### Do:
- **Do** lead with verifiable, specific claims — exact intervals, exact prices, exact thresholds. The page should read like evidence.
- **Do** keep secondary text at neutral gray-green #4C5953 (≥4.5:1 on white) and primary text at Carbon Black #081C15; reserve Hunter Green for semantic moments — actions, prices, checks, state dots.
- **Do** use the two-voice color rule: green for what Veracity captures, Verification Teal #005A63 for what it never does.
- **Do** keep surfaces flat with 1px Celadon hairlines; reserve the two shadows for floating surfaces only — `ledger-lift` on the ledger panel, `menu-float` on the mega-menu panel.
- **Do** make every mega-menu panel the same width (`w-[min(46rem,calc(100vw-2.5rem))]`); single-column items spread their links across the three-cell grid.
- **Do** honor `prefers-reduced-motion` — every animation has a reduced-motion alternative (entrances become opacity-only, pulses stop, the cursor ring disables).
- **Do** set keyboard focus as a 2px Verification Teal ring with 3px offset, and ship real `:focus-visible` states on every interactive element — including keyboard-only access to the mega menu (focus opens, Escape closes and returns focus).

### Don't:
- **Don't** look like a generic AI/SaaS template: cream/sand backgrounds, gradient text, tiny uppercase eyebrows on every section, identical icon-card grids.
- **Don't** look like a surveillance / enterprise-tool dashboard: dark control-center aesthetics, cold dense grids, red alert accents, CCTV overtones.
- **Don't** look like a dark cyber / hacker aesthetic: glowing neon, terminal fonts, "we see everything" overtones.
- **Don't** look like a corporate brochure: stock-photo blandness, vague slogans, no specifics, no backbone.
- **Don't** use side-stripe borders, gradient text, glassmorphism-as-default, or hero-metric-stat blocks.
- **Don't** invent a fourth activity state color — the four states (green, blue, gray, gold) are a closed semantic set.
- **Don't** add a fifth plan or rebalance the three tiers' pricing in the UI; the pricing table is the single source of truth for all pricing answers.
- **Don't** let the cursor ring replace the native cursor or the teal `:focus-visible` ring — the ring is decoration, never an input or focus affordance.
