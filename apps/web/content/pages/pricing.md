---
title: Pricing
slug: pricing
order: 3
---

# Veracity Pricing — Plans, Features, and Billing

Simple, per-user pricing with no hidden fees. All plans include a fourteen-day free trial with full access to all features of the chosen plan. No credit card required for the trial. At the end of the trial, you will be asked to choose a plan and provide payment information.

---

## Plan Comparison Table

This table is the single source of truth for all pricing and feature-inclusion data. Every price, term, and feature boundary documented here is authoritative.

| Feature | Starter | Growth | Enterprise |
|---------|---------|--------|------------|
| **Monthly price per user** | $6 | $12 | $24 |
| **Annual price per user per year** | $60 ($5/mo) | $120 ($10/mo) | $240 ($20/mo) |
| Activity tracking (60s heartbeat) | ✓ | ✓ | ✓ |
| App and URL categorization (customizable) | ✓ | ✓ | ✓ |
| Daily productivity score (0–100, published methodology) | ✓ | ✓ | ✓ |
| Confidence indicators (High/Uncertain) | ✓ | ✓ | ✓ |
| Employee dashboard (real-time via SSE) | ✓ | ✓ | ✓ |
| Private Time mode | ✓ | ✓ | ✓ |
| Meeting-aware idle detection (Google Calendar, Outlook) | ✓ | ✓ | ✓ |
| Offline encrypted cache (AES-256, 7-day TTL, 50 MB) | ✓ | ✓ | ✓ |
| USB device detection (logging only) | ✓ | ✓ | ✓ |
| File operation tracking (path only) | ✓ | ✓ | ✓ |
| Dispute and review workflow (5 business day SLA) | ✓ | ✓ | ✓ |
| Guided setup wizard (< 30 minutes) | ✓ | ✓ | ✓ |
| Policy acknowledgment and consent management | ✓ | ✓ | ✓ |
| Data Subject Access Request (DSAR) workflows | ✓ | ✓ | ✓ |
| Jurisdiction-aware notice engine | ✓ | ✓ | ✓ |
| Tamper-evident audit logging | ✓ | ✓ | ✓ |
| Screenshot monitoring | — | ✓ (10-minute interval) | ✓ (configurable 1–60 min) |
| Client-side redaction (OCR, default) | — | ✓ | ✓ |
| Sensitive-app exclusion list (configurable) | — | ✓ | ✓ |
| Manager-request screenshot viewing (logged) | — | ✓ | ✓ |
| Team benchmarking (aggregate) | — | ✓ | ✓ |
| Team benchmarking (identifiable, with consent) | — | — | ✓ |
| REST API (1,000 requests per hour) | — | ✓ | — |
| REST API (10,000 requests per hour) | — | — | ✓ |
| SSO / SAML 2.0 (Okta, Azure AD, Google Workspace) | — | — | ✓ |
| Custom data retention (per data type, automated deletion) | — | — | ✓ |
| Compliance reports (PDF and CSV export) | — | — | ✓ |
| Bulk user provisioning (CSV upload, 500 rows) | — | Optional | ✓ |
| MDM agent deployment (Intune, Jamf Pro) | — | — | ✓ |
| Dedicated account manager | — | — | ✓ |
| User limit | 10 | 50 | Unlimited |
| Support channel | Email | In-app chat | Dedicated + 24/7 |
| Support response time target | Within 1 business day | Within 4 hours (business hours) | Within 1 hour (business), 24/7 for critical |
| Support hours | Business hours | Business hours | Business hours + 24/7 critical |
| Additional user seats beyond plan limit | Not available | Not available | Not applicable (unlimited) |

---

## Plan Details

### Starter — $6 per user per month ($60 per user per year with annual billing)

Best for small teams of up to 10 users that need essential productivity tracking. Includes activity monitoring, daily productivity scores with published methodology and confidence indicators, employee dashboards with real-time SSE updates, meeting-aware idle detection via Google Calendar and Outlook, offline encrypted caching with AES-256, Private Time mode, dispute workflow, and email support with response within one business day.

### Growth — $12 per user per month ($120 per user per year with annual billing)

Best for growing teams of up to 50 users that need deeper visibility. Everything in Starter, plus periodic screenshot monitoring at a ten-minute interval with client-side redaction, sensitive-app exclusion list, manager-request screenshot viewing with audit logging, aggregate team benchmarking (individual scores are not visible to other team members), REST API access with a rate limit of 1,000 requests per hour, and in-app chat support with response within four hours during business hours.

### Enterprise — $24 per user per month ($240 per user per year with annual billing)

Best for organizations with unlimited users that need full control. Everything in Growth, plus configurable screenshot capture interval (from every 1 minute to every 60 minutes), identifiable team benchmarking with employee consent where required by local regulation, REST API access with a rate limit of 10,000 requests per hour, SSO and SAML 2.0 integration with Okta, Azure Active Directory, and Google Workspace, custom data retention periods configurable per data type with automated deletion, automated compliance reports in PDF and CSV formats, bulk user provisioning via CSV upload (up to 500 rows), MDM agent deployment support (Microsoft Intune, Jamf Pro), a dedicated account manager, and priority support with one-hour response during business hours and 24/7 coverage for critical issues.

---

## Billing Details

### How Billing Is Calculated

Billing is calculated per active user per month. An active user is any employee who has the Veracity Agent installed and has sent at least one heartbeat in the billing period. Employees who have not sent a heartbeat for thirty consecutive days are classified as inactive and are not billed. Billing is calculated at the end of each billing period based on the average number of active users during that period.

### Annual Billing Discount

Annual billing is available at a discount of two months per year. Under annual billing, you pay for ten months of service per year and receive two months free:
- **Annual Starter**: $60 per user per year (equivalent to $5 per user per month)
- **Annual Growth**: $120 per user per year (equivalent to $10 per user per month)
- **Annual Enterprise**: $240 per user per year (equivalent to $20 per user per month)

Annual plans are billed once per year. No partial refunds are given for mid-cycle downgrades under annual billing.

### Free Trial

All plans include a fourteen-day free trial with full access to all features of the chosen plan. No credit card is required. At the end of the trial period, you will be prompted to choose a plan and provide payment information. Data collected during the trial is preserved if you convert to a paid plan.

### Switching Plans

You can upgrade or downgrade at any time. Plan changes take effect at the start of the next billing cycle. Charges are prorated for the remainder of the current billing cycle. Feature access during the current cycle remains at your existing plan level until the change takes effect.

### Exceeding User Limits

When your organization reaches ninety percent of your plan's user limit, all organization administrators receive a notification. If you exceed the limit, new Agent installations are blocked and existing Agents continue to function. You will be prompted to upgrade to the next tier. Additional user seats beyond a plan's limit are not available — you must upgrade to a higher tier. The Starter plan supports up to 10 users. The Growth plan supports up to 50 users. The Enterprise plan has no user limit.

### Non-Profit and Educational Discounts

Veracity offers a twenty percent discount for verified non-profit organizations and accredited educational institutions. Contact sales@veracity.dev with your verification documents to have the discount applied to your account. The discount applies to monthly and annual billing on all plans.

### Payment Methods

Veracity accepts major credit cards and debit cards (Visa, Mastercard, American Express, Discover). Enterprise plans may be eligible for invoicing (net-30 terms) for annual contracts. Contact sales@veracity.dev for invoicing inquiries.

### Data Retention After Cancellation

When an organization cancels their Veracity subscription, all collected data is retained for 30 days (grace period for reactivation). After the grace period expires, all data is permanently deleted. Retention policies during the active subscription period are configurable on Enterprise plans.

---

## What Veracity Does Not Offer

The following are deliberate exclusions across all plans and are not available at any tier:
- **Keystroke logging** — Veracity never logs keystrokes, key counts, or any form of keyboard input content
- **Continuous video or screen recording** — periodic screenshots only, never continuous recording
- **Stealth or covert monitoring** — the Agent is always visible and identifiable in the system tray
- **Audio or webcam capture** — no microphone or webcam data collection
- **Emotion recognition or biometric inference** — prohibited by the EU AI Act and product positioning
- **On-premise deployment** — cloud-native SaaS only
- **HRIS or SCIM integration** — deferred post-MVP
- **DLP policy enforcement** — USB and file events are logging-only, no allow/deny enforcement
