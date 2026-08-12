# Lighthouse Report — phase2a

- Generated: 2026-08-11T11:16:23.887Z
- Chrome: /usr/bin/chromium
- Viewports: mobile — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: FAIL** (3/8 route×viewport audits meet the threshold)

## Mobile

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **86 ⚠** | **100** | 100 | 100 | 2049ms | 533ms | 0.000 |
| /features | **88 ⚠** | **100** | 100 | 100 | 2023ms | 462ms | 0.000 |
| /pricing | **74 ⚠** | **91** | 100 | 100 | 2423ms | 1193ms | 0.000 |
| /why-veracity | **79 ⚠** | **100** | 100 | 100 | 2442ms | 785ms | 0.000 |
| /about | **92** | **100** | 100 | 100 | 2414ms | 276ms | 0.000 |
| /case-studies | **92** | **100** | 100 | 100 | 2432ms | 277ms | 0.000 |
| /integrations | **94** | **100** | 100 | 100 | 2178ms | 260ms | 0.000 |
| /compliance | **85 ⚠** | **100** | 100 | 100 | 2427ms | 486ms | 0.000 |
