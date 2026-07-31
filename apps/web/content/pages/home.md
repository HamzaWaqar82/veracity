---
title: Home
slug: home
order: 1
---

# Veracity — Workforce Analytics Built on Trust, Not Surveillance

Veracity is a cloud-native workforce-analytics platform designed specifically for small-to-medium businesses with 10 to 200 employees. We give managers objective productivity data while giving every employee full transparency into what is tracked, when, and why. Veracity is positioned explicitly as a workforce-analytics tool — not a security or DLP product — with trust-preserving defaults at every tier.

## The Problem: You Cannot Manage What You Cannot See

Remote and hybrid work have made it harder for managers to understand how their teams spend time. The traditional response — deploying surveillance software that captures everything, hides itself from employees, and reports activity without context — erodes trust, drives away talent, and often creates more resentment than insight. Employees feel watched. Managers get data they cannot act on. Productivity conversations become personal rather than constructive.

## The Veracity Approach: Collect Less, Show More

Veracity takes the opposite approach from traditional monitoring tools. We collect only what is necessary for meaningful productivity analytics, we show every employee exactly what we know about them, and we never operate in secret. Our desktop Agent runs visibly on every workstation with a clear indicator in the system tray. There is no stealth mode, no hidden capture, no data collected without the employee's knowledge.

### Three Core Principles

**Data Minimization.** Veracity does not log keystrokes, record audio or video, capture webcam or microphone data, or perform continuous screen recording. Our activity tracking captures application names, window titles, and URL domains at sixty-second heartbeat intervals — enough to understand work patterns, not enough to invade privacy. Screenshot capture (optional, on Growth and Enterprise plans) happens at fixed intervals with client-side redaction and encryption. This is a deliberate architectural constraint that applies at every tier, now and in all future versions.

**Employee Visibility.** Every employee can see exactly what data Veracity has collected about them in real time through their personal dashboard — the same data their manager sees. The Agent is always identifiable in the system tray with a visible status indicator. Private Time mode lets employees pause all capture with one click; only the session duration is recorded. There is no data hidden from employees. The employee dashboard includes a complete access log showing who has viewed their data and when.

**Compliance-First Design.** Veracity is built to comply with the General Data Protection Regulation (GDPR), the EU Artificial Intelligence Act, and relevant US state electronic monitoring statutes including Connecticut General Statute Section 31-48d and New York Labor Law Section 52-c. Our compliance infrastructure includes jurisdiction-aware notice engines, tamper-evident audit logging, configurable data retention with automated deletion, Data Subject Access Request (DSAR) workflows, and Data Protection Impact Assessment (DPIA) support. We do not perform emotion recognition, biometric categorization, or any form of automated decision-making that the AI Act restricts.

## How Veracity Works

The Veracity platform has three components:

**The Agent.** A cross-platform desktop application installed on each employee workstation. The Agent captures activity data — application usage, window titles, URL visits — at sixty-second heartbeat intervals and transmits it to the server over encrypted TLS 1.3 connections. On plans that include it, the Agent also captures periodic screenshots with client-side redaction and encryption. The Agent supports Windows 10 and 11, macOS Ventura and later, and major Linux distributions including Ubuntu 22.04 and later.

**The Server.** A cloud-hosted backend that receives activity data, classifies events into productivity categories using a configurable categorization engine, calculates daily productivity scores using a published methodology, and provides REST APIs and real-time SSE streams for the web portal and integrations. The server manages organization policies, user roles, compliance controls, and data retention with automated deletion.

**The Web Portal.** A responsive web application accessible from any modern browser. Managers see team dashboards with productivity trends, benchmarking data, and activity logs. Employees see their own identical dashboard with the same data. Administrators configure policies, manage users, view audit logs, and generate compliance reports.

## Product Activity States

The Veracity Agent tracks employee activity through four primary states:

**ACTIVE.** The employee is actively using the workstation — keyboard or mouse input detected within the idle threshold (default: 180 seconds of inactivity).

**PASSIVE.** The employee is engaged with work but not actively inputting — reading a document, watching a training video, or participating in a meeting. Passive attention is detected via calendar integration (Google Calendar, Outlook) or heuristic window analysis.

**IDLE.** The employee is away from the workstation — no keyboard or mouse input beyond the idle threshold. Idle time is not penalized in productivity scoring; it is excluded from calculations entirely.

**PRIVATE_TIME.** The employee has activated Private Time mode. All capture is suppressed except session duration tracking. Heartbeats continue during Private Time, reporting the PRIVATE_TIME state.

## Three Plans for Every Team Size

Veracity offers three tiered plans with overlapping but distinguishable features:

| Feature | Starter | Growth | Enterprise |
|---------|---------|--------|------------|
| Price per user per month | $6 | $12 | $24 |
| Activity tracking (60s heartbeat) | ✓ | ✓ | ✓ |
| App and URL categorization | ✓ | ✓ | ✓ |
| Daily productivity score (0–100) | ✓ | ✓ | ✓ |
| Employee dashboard with SSE | ✓ | ✓ | ✓ |
| Meeting-aware idle detection | ✓ | ✓ | ✓ |
| Offline encrypted cache | ✓ | ✓ | ✓ |
| Screenshot monitoring | — | 10-min interval | Configurable 1–60 min |
| Team benchmarking | — | Aggregate only | Aggregate or identifiable |
| REST API | — | 1,000 req/hour | 10,000 req/hour |
| SSO / SAML 2.0 | — | — | ✓ |
| Support | Email (1 business day) | In-app chat (4 hours) | Dedicated + 24/7 |
| User limit | 10 | 50 | Unlimited |
| Custom data retention | — | — | ✓ |
| Compliance reports | — | — | ✓ |

See the [Features page](/features) for a detailed breakdown and the [Pricing page](/pricing) for complete pricing information.

## Compliance and Security Highlights

- **No keystroke logging** — ever, at any tier
- **No audio or video recording** — continuous recording is out of scope by design
- **No stealth mode** — Agent is always visible and identifiable
- **Encryption in transit**: TLS 1.3
- **Encryption at rest**: AES-256 with per-file keys for screenshots
- **Client-side redaction**: Sensitive fields redacted before upload
- **Sensitive-app exclusion**: Configurable list; defaults include password managers and banking domains
- **Tamper-evident audit logging**: Every access to monitoring data is logged
- **Automated data retention**: Configurable per data type with enforced deletion
- **Private Time**: Employee-initiated capture pause, enforced locally even offline, with configurable daily limits

## Trusted by Growing Teams

> "We needed visibility into our remote team's workflow without making people feel like they were being spied on. Veracity gave us exactly that — actionable productivity data with zero creep factor. The fact that our employees can see everything we see made adoption smooth and trust high."
>
> *— Sarah Chen, CEO, Luminate Digital (45 employees)*

> "As a compliance officer, I was skeptical about employee monitoring tools. Veracity is the first platform I have seen that genuinely prioritizes privacy. The audit trail, consent management, and data retention controls give me everything I need for GDPR compliance without the usual surveillance baggage."
>
> *— Marcus Okonkwo, Head of Compliance, Helios Consulting (120 employees)*

## Ready to See the Difference?

Veracity offers a fourteen-day free trial on all plans with full access to all features of the chosen plan. No credit card required. Explore our features, compare plans, or contact our sales team for a personalized walkthrough.

[Explore Features](/features) · [View Pricing](/pricing) · [Start Free Trial](/pricing) · [Contact Sales](/about)
