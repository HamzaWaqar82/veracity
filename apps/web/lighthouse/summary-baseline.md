# Lighthouse Report — baseline

- Generated: 2026-08-11T10:48:02.391Z
- Chrome: /usr/bin/chromium
- Viewports: mobile, desktop — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: FAIL** (27/36 route×viewport audits meet the threshold)

## Mobile

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **87 ⚠** | **100** | 100 | 100 | 2187ms | 474ms | 0.000 |
| /features | **87 ⚠** | **98** | 100 | 100 | 2303ms | 458ms | 0.000 |
| /pricing | **74 ⚠** | **98** | 100 | 100 | 2165ms | 1307ms | 0.000 |
| /why-veracity | **79 ⚠** | **100** | 100 | 100 | 2322ms | 816ms | 0.000 |
| /resources | **96** | **100** | 100 | 100 | 2221ms | 178ms | 0.000 |
| /about | **89 ⚠** | **98** | 100 | 100 | 2192ms | 384ms | 0.000 |
| /faq | **96** | **100** | 100 | 100 | 2463ms | 142ms | 0.000 |
| /case-studies | **71 ⚠** | **98** | 100 | 100 | 2694ms | 1370ms | 0.000 |
| /integrations | **87 ⚠** | **98** | 100 | 100 | 2949ms | 311ms | 0.000 |
| /compliance | **82 ⚠** | **98** | 100 | 100 | 2178ms | 682ms | 0.000 |
| /contact-us | **94** | **100** | 100 | 100 | 2017ms | 257ms | 0.000 |
| /privacy | **95** | **100** | 100 | 100 | 2047ms | 232ms | 0.000 |
| /terms | **90** | **100** | 100 | 100 | 2067ms | 373ms | 0.000 |
| /trial | **90** | **100** | 100 | 100 | 2818ms | 251ms | 0.000 |
| /request-demo | **91** | **100** | 100 | 100 | 2073ms | 344ms | 0.000 |
| /resources/how-productivity-scoring-works | **98** | **100** | 100 | 100 | 2147ms | 103ms | 0.000 |
| /resources/transparent-monitoring-for-modern-teams | **98** | **100** | 100 | 100 | 2168ms | 130ms | 0.000 |
| /resources/smb-guide-to-workforce-analytics | **96** | **100** | 100 | 100 | 2172ms | 194ms | 0.000 |

## Desktop

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **100** | **100** | 100 | 100 | 556ms | 52ms | 0.000 |
| /features | **100** | **98** | 100 | 100 | 552ms | 59ms | 0.000 |
| /pricing | **84 ⚠** | **98** | 100 | 100 | 518ms | 369ms | 0.000 |
| /why-veracity | **99** | **98** | 100 | 100 | 549ms | 97ms | 0.000 |
| /resources | **100** | **100** | 100 | 100 | 510ms | 0ms | 0.000 |
| /about | **100** | **98** | 100 | 100 | 560ms | 8ms | 0.000 |
| /faq | **100** | **100** | 100 | 100 | 547ms | 0ms | 0.000 |
| /case-studies | **97** | **98** | 100 | 100 | 445ms | 65ms | 0.000 |
| /integrations | **100** | **98** | 100 | 100 | 618ms | 55ms | 0.000 |
| /compliance | **100** | **98** | 100 | 100 | 587ms | 76ms | 0.000 |
| /contact-us | **100** | **100** | 100 | 100 | 533ms | 8ms | 0.000 |
| /privacy | **100** | **100** | 100 | 100 | 527ms | 0ms | 0.000 |
| /terms | **100** | **100** | 100 | 100 | 495ms | 0ms | 0.000 |
| /trial | **100** | **100** | 100 | 100 | 523ms | 1ms | 0.000 |
| /request-demo | **100** | **100** | 100 | 100 | 511ms | 0ms | 0.000 |
| /resources/how-productivity-scoring-works | **100** | **100** | 100 | 100 | 581ms | 0ms | 0.000 |
| /resources/transparent-monitoring-for-modern-teams | **100** | **100** | 100 | 100 | 551ms | 0ms | 0.000 |
| /resources/smb-guide-to-workforce-analytics | **100** | **100** | 100 | 100 | 553ms | 0ms | 0.000 |
