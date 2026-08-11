# Lighthouse Report — phase2c

- Generated: 2026-08-11T11:40:24.098Z
- Chrome: /usr/bin/chromium
- Viewports: mobile — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: FAIL** (4/8 route×viewport audits meet the threshold)

## Mobile

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **86 ⚠** | **100** | 100 | 100 | 2031ms | 514ms | 0.000 |
| /features | **90** | **100** | 100 | 100 | 2001ms | 375ms | 0.000 |
| /pricing | **88 ⚠** | **100** | 100 | 100 | 2019ms | 466ms | 0.000 |
| /why-veracity | **83 ⚠** | **100** | 100 | 100 | 2418ms | 567ms | 0.000 |
| /about | **95** | **100** | 100 | 100 | 2155ms | 231ms | 0.000 |
| /case-studies | **91** | **100** | 100 | 100 | 2162ms | 334ms | 0.000 |
| /integrations | **93** | **100** | 100 | 100 | 2155ms | 276ms | 0.000 |
| /compliance | **88 ⚠** | **100** | 100 | 100 | 2418ms | 402ms | 0.000 |
