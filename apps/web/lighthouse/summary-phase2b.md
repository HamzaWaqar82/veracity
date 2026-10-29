# Lighthouse Report — phase2b

- Generated: 2026-08-11T11:31:15.835Z
- Chrome: /usr/bin/chromium
- Viewports: mobile — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: FAIL** (0/5 route×viewport audits meet the threshold)

## Mobile

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **84 ⚠** | **100** | 100 | 100 | 2039ms | 597ms | 0.000 |
| /features | **85 ⚠** | **100** | 100 | 100 | 2425ms | 503ms | 0.000 |
| /pricing | **82 ⚠** | **92** | 100 | 100 | 2019ms | 710ms | 0.000 |
| /why-veracity | **82 ⚠** | **100** | 100 | 100 | 2436ms | 601ms | 0.000 |
| /compliance | **88 ⚠** | **100** | 100 | 100 | 2014ms | 454ms | 0.000 |
