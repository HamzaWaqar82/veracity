# Lighthouse Report — phase2d

- Generated: 2026-08-11T11:54:33.880Z
- Chrome: /usr/bin/chromium
- Viewports: desktop — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: PASS** (3/3 route×viewport audits meet the threshold)

## Desktop

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **99** | **100** | 100 | 100 | 598ms | 81ms | 0.000 |
| /pricing | **100** | **100** | 100 | 100 | 571ms | 64ms | 0.000 |
| /case-studies | **100** | **100** | 100 | 100 | 569ms | 5ms | 0.000 |
