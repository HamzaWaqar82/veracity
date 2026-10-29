# Lighthouse Report — verify

- Generated: 2026-08-11T11:55:38.160Z
- Chrome: /usr/bin/chromium
- Viewports: mobile, desktop — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).
- Gate: Performance & Accessibility >= 90 on every route × viewport.
- Method: local production build via `next start` (no deployment required). Raw JSON in `lighthouse/raw/` (gitignored).

**Gate result: FAIL** (31/36 route×viewport audits meet the threshold)

## Mobile

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **87 ⚠** | **100** | 100 | 100 | 2014ms | 473ms | 0.000 |
| /features | **81 ⚠** | **100** | 100 | 100 | 2039ms | 737ms | 0.000 |
| /pricing | **81 ⚠** | **100** | 100 | 100 | 2191ms | 745ms | 0.000 |
| /why-veracity | **79 ⚠** | **100** | 100 | 100 | 2928ms | 586ms | 0.000 |
| /resources | **95** | **100** | 100 | 100 | 2270ms | 214ms | 0.000 |
| /about | **95** | **100** | 100 | 100 | 2003ms | 246ms | 0.000 |
| /faq | **94** | **100** | 100 | 100 | 2318ms | 233ms | 0.000 |
| /case-studies | **91** | **100** | 100 | 100 | 2009ms | 353ms | 0.000 |
| /integrations | **96** | **100** | 100 | 100 | 2001ms | 215ms | 0.000 |
| /compliance | **88 ⚠** | **100** | 100 | 100 | 2012ms | 468ms | 0.000 |
| /contact-us | **94** | **100** | 100 | 100 | 2017ms | 268ms | 0.000 |
| /privacy | **99** | **100** | 100 | 100 | 1864ms | 121ms | 0.000 |
| /terms | **99** | **100** | 100 | 100 | 1854ms | 91ms | 0.000 |
| /trial | **96** | **100** | 100 | 100 | 1856ms | 211ms | 0.000 |
| /request-demo | **97** | **100** | 100 | 100 | 1851ms | 199ms | 0.000 |
| /resources/how-productivity-scoring-works | **91** | **100** | 100 | 100 | 2264ms | 329ms | 0.000 |
| /resources/transparent-monitoring-for-modern-teams | **95** | **100** | 100 | 100 | 2011ms | 220ms | 0.000 |
| /resources/smb-guide-to-workforce-analytics | **97** | **100** | 100 | 100 | 2016ms | 153ms | 0.000 |

## Desktop

| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | **100** | **100** | 100 | 100 | 566ms | 68ms | 0.000 |
| /features | **100** | **100** | 100 | 100 | 561ms | 55ms | 0.000 |
| /pricing | **97** | **100** | 100 | 100 | 585ms | 147ms | 0.000 |
| /why-veracity | **92** | **100** | 100 | 100 | 612ms | 226ms | 0.000 |
| /resources | **100** | **100** | 100 | 100 | 489ms | 0ms | 0.000 |
| /about | **100** | **100** | 100 | 100 | 562ms | 17ms | 0.000 |
| /faq | **100** | **100** | 100 | 100 | 509ms | 0ms | 0.000 |
| /case-studies | **100** | **100** | 100 | 100 | 560ms | 1ms | 0.000 |
| /integrations | **100** | **100** | 100 | 100 | 552ms | 10ms | 0.000 |
| /compliance | **100** | **100** | 100 | 100 | 558ms | 43ms | 0.000 |
| /contact-us | **100** | **100** | 100 | 100 | 519ms | 0ms | 0.000 |
| /privacy | **100** | **100** | 100 | 100 | 475ms | 0ms | 0.000 |
| /terms | **100** | **100** | 100 | 100 | 477ms | 0ms | 0.000 |
| /trial | **100** | **100** | 100 | 100 | 521ms | 0ms | 0.000 |
| /request-demo | **100** | **100** | 100 | 100 | 515ms | 0ms | 0.000 |
| /resources/how-productivity-scoring-works | **100** | **100** | 100 | 100 | 519ms | 0ms | 0.000 |
| /resources/transparent-monitoring-for-modern-teams | **100** | **100** | 100 | 100 | 525ms | 0ms | 0.000 |
| /resources/smb-guide-to-workforce-analytics | **100** | **100** | 100 | 100 | 527ms | 0ms | 0.000 |
