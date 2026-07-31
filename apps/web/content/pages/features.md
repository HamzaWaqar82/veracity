---
title: Features
slug: features
order: 2
---

# Veracity Features — Complete Guide by Plan Tier

Three plans, one philosophy. Every tier of Veracity includes core activity tracking, productivity analytics, employee self-service dashboards, and compliance infrastructure. Upgrade for deeper visibility with screenshot monitoring, team benchmarking, API access, and advanced administrative controls. Veracity is a cloud-native SaaS platform — no on-premise deployment is available.

---

## Starter — $6 per user per month

Designed for small teams (up to 10 users) that need lightweight productivity visibility without overcomplicating things. Starter covers all essentials: application and website usage tracking, time distribution analysis, and a daily productivity score based on objective activity data.

### Activity Tracking

**Application and Window Title Logging.** The Veracity Agent captures the active application name, executable path, process ID, and window title at sixty-second heartbeat intervals. On macOS, the Agent uses the Accessibility API to read the frontmost application. On Linux, the Agent reads the _NET_ACTIVE_WINDOW property via X11 or the native Wayland protocol. On Windows, the Agent uses the GetForegroundWindow and GetWindowText APIs. If the Agent cannot obtain a window title (for example, on Wayland without a portal), it reports a degradation state and continues capturing available data.

**URL Tracking (Domain Default).** The Agent captures the active browser domain (not the full URL path) by default. Organizations can optionally enable full-path URL capture at the policy level. The URL capture mode is reported in every heartbeat and visible to employees in their activity log and policy display. URL data is treated as personal data subject to retention policies and DSAR export.

**Idle-State Detection with Meeting Awareness.** The Agent detects idle states using a configurable threshold (default: 180 seconds of inactivity). When keyboard or mouse input stops, the Agent transitions from ACTIVE to IDLE after the threshold expires. If a meeting is detected via calendar integration (Google Calendar or Outlook) or heuristic window analysis (Zoom, Teams, Meet windows), the Agent transitions to PASSIVE-ATTENTION instead of IDLE. Passive-attention time is not penalized in productivity scoring.

**Activity State Model.** The Agent tracks four states:
- ACTIVE: keyboard or mouse input within the idle threshold
- PASSIVE: engaged with work but not actively inputting (reading, meeting, training)
- IDLE: away from the workstation beyond the idle threshold
- PRIVATE_TIME: employee-initiated capture pause (see below)

Heartbeats continue in all states, reporting the current enforced state including screenshot capability, redaction status, exclusion list version, platform consent state, and any degradation mode.

**Offline Encrypted Cache.** When connectivity is lost, the Agent caches activity data locally using AES-256 encryption with a device-specific key derived from the enrollment token. The cache uses SQLCipher and stores data in a local SQLite database. Maximum cache size is 50 MB with a 7-day TTL and oldest-first eviction. When connectivity is restored, the Agent auto-syncs cached events to the server in capture-time order using exponential backoff retry (30s, 60s, 120s, 300s, 600s — capped at 10-minute intervals). Sync failures past a retry threshold trigger a quarantine state.

**USB Device Detection (Logging Only).** Starter (and all plans) detect USB device connection and disconnection events on the workstation. Only device identifiers are logged — no file content inspection, no allow/deny enforcement. USB events are a subtype of activity events.

**File Operation Tracking (Path Only).** Starter (and all plans) detect file creation, rename, and deletion events. Only the file path is logged, not file contents. File events are a subtype of activity events.

### App Categorization Engine

**Automatic Classification.** Applications and websites are automatically categorized as Productive, Neutral, or Unproductive using a built-in classification engine. Classification rules are configurable per organization. Managers can override classifications for specific applications, and the override triggers an automatic score recalculation for the affected date range.

**Confidence Indicators.** Each classification event carries a confidence level: "Certain" (high-confidence match) or "Uncertain" (ambiguous or mixed history). When uncertain events exceed 20% of active time, the daily score carries an "Uncertain — Mixed Context" indicator.

**Audit Trail.** Every classification decision — default classification, manager override, and ambiguity flag — is logged in the audit trail.

### Productivity Scoring

**Daily Score with Published Methodology.** A daily productivity score from 0 to 100 is calculated using the following published formula:

```
productivity_score = round(
  (productive_ms + 0.5 * passive_ms) /
  (productive_ms + neutral_ms + unproductive_ms + 0.5 * passive_ms) * 100
)
```

Where:
- **productive_ms**: Time in applications and URLs classified as Productive
- **neutral_ms**: Time in applications and URLs classified as Neutral
- **unproductive_ms**: Time in applications and URLs classified as Unproductive
- **passive_ms**: Time in PASSIVE-ATTENTION state (counts at half weight)
- **idle_ms**: Time in IDLE state (excluded from calculation — not penalized)
- **private_ms**: Time in Private Time (excluded entirely)

**Score Calculation.** Scores are calculated at the end of each day (midnight local time) or when the employee ends their session. Active time is defined as productive_ms + neutral_ms + unproductive_ms + passive_ms. If active_time_ms is zero, the score is null (insufficient data), not zero. If only Private Time was used, the score is null. The score is capped at 100 if the numerator exceeds the denominator. Each score record stores the methodology version ("1.0") for audit traceability.

**Confidence Indicators.** Every daily score carries one of three confidence levels:
- **High Confidence**: Less than 20% uncertain events and at least 2 hours of active time
- **Uncertain — Mixed Context**: 20% or more of active time from uncertain events
- **Uncertain — Insufficient Data**: Less than 2 hours of active time

Indicators are displayed next to the score with color-coded icons (green/orange/gray) and tooltip explanations. Managers see the same indicators for aggregate team views.

**No Accuracy Percentage Claims.** Veracity never claims a single "accuracy percentage" (e.g., "greater than 95% accurate") anywhere in the product, in any UI, API response, or documentation. The published methodology is the only accuracy representation.

**Peak Productivity Hours.** The system identifies the employee's most productive time window each day based on their classified activity distribution. Peak hours are shown on the employee dashboard and available via API.

**Personal Baseline Comparison.** The employee dashboard shows trend data comparing the current day's score to the employee's personal baseline (historical average), helping employees and managers understand whether performance is improving, declining, or stable.

### Employee Dashboard

Every employee has access to a personal dashboard that shows exactly the same data their manager sees:
- Daily productivity score with confidence indicator and breakdown (productive, neutral, unproductive, idle, passive time in milliseconds)
- Real-time activity timeline with application and URL details
- Trend chart showing score history over time (daily, weekly, monthly views)
- Peak productivity hours identification
- Personal baseline comparison
- Private Time status indicator and remaining allowance
- Complete access log showing who has viewed their data and when

The dashboard updates in real time via SSE (Server-Sent Events). Data refreshes every sixty seconds. The dashboard has a responsive mobile layout.

### Quick Actions (All Tiers)

From the dashboard or Agent system tray, employees can:
- **Start Private Time** — pause all capture with one click
- **View Activity Log** — detailed timeline of tracked activity
- **Dispute a Score** — submit a formal dispute contesting a classification or score
- **Export My Data** — download a full DSAR package of all collected data
- **View Policy** — read the current monitoring policy
- **Acknowledge Policy** — digitally acknowledge receipt of policy notices

### Meeting-Aware Idle Detection

Veracity integrates with Google Calendar and Outlook to detect scheduled meetings automatically. When an employee has a calendar event during work hours, the Agent records the time as PASSIVE-ATTENTION rather than IDLE, even without keyboard or mouse input. This prevents legitimate meeting time from being miscategorized as idle time or penalized in scoring.

Calendar data is read-only — Veracity never creates, modifies, or deletes calendar events. OAuth tokens for calendar access are encrypted at rest (AES-256) and associated with the employee record.

### Data Encryption (All Tiers)

All data in transit uses TLS 1.3. All data at rest in the server database uses AES-256. The Agent's offline cache uses AES-256 with a device-specific key that is never transmitted to the server. Screenshots use per-file encryption keys stored separately from the screenshot data.

### Compliance Basics (All Tiers)

All plans include standard GDPR data processing controls, consent management, and Data Subject Access Request (DSAR) workflows. The jurisdiction-aware notice engine selects the appropriate policy template based on the organization's registered jurisdiction (CT, NY, DE, CO, EU, or other). See our [Compliance page](/compliance) for details.

---

## Growth — $12 per user per month

Everything in Starter, plus visual monitoring, team-level analytics, API access, and expanded support. Growth is built for growing teams (up to 50 users) that need deeper visibility into workflow patterns and the ability to benchmark across the organization.

### Screenshot Monitoring (Starter does not include screenshots)

**Periodic Capture.** The Agent captures screenshots at a fixed ten-minute interval. Each capture captures all connected monitors simultaneously. Screenshots are captured as JPEG images at quality level 80. EXIF and metadata are stripped before encryption. Screenshots are uploaded to object storage (S3-compatible) via signed URLs with 5-minute expiry.

**Client-Side Redaction (Default).** Screenshots are redacted client-side before upload. The Agent performs OCR-based heuristic detection for password fields, credit card fields, and other sensitive fields and redacts them before the screenshot is transmitted. If the foreground application is in the sensitive-app exclusion list, the Agent either redacts the entire screenshot or skips capture entirely. If redaction fails (e.g., OCR library missing), the screenshot is not uploaded. The redaction active state (`redaction_active: true/false`) and version (`redaction_version`) are reported in every heartbeat.

**Manager-Request Viewing.** Screenshots are stored in a redacted state by default. A manager must actively request to view a specific screenshot. The request is logged in the audit trail. When a screenshot is viewed, the employee receives a notification. Screenshots are never used for automated analysis, flagging, or alerting.

**Encryption.** Screenshots are encrypted at rest in object storage using SSE-S3 or equivalent AES-256 encryption. Access is via signed URLs with configurable expiry. No persistent unencrypted screenshot storage exists at any point.

**Sensitive-App Exclusion List.** Organizations can configure an exclusion list of applications that should never be screenshotted. The exclusion list supports three match types:
- Executable name (e.g., `1Password.exe`, `LastPass.app`, `Bitwarden.exe`)
- Window title substring (e.g., "Chase Bank", "Wells Fargo Online")
- Browser domain (e.g., `chase.com`, `bankofamerica.com`)

The default exclusion list includes common password managers (1Password, LastPass, Bitwarden, KeePass) and major banking domains. When an excluded app is in the foreground, the Agent skips capture and logs `skip_reason: sensitive_app_excluded`. The exclusion list version is reported in every heartbeat. List updates are pushed to all agents via SSE or the next heartbeat response within 5 minutes.

**macOS Permission Flow.** On macOS, screenshot capture requires Screen Recording permission. The Agent uses the TCC (Transparency, Consent, and Control) framework and guides the user through granting permission. If permission is denied, the Agent operates in degraded mode without screenshots and raises an admin alert. Organizations using MDM can deploy a PPPC profile to pre-approve the Screen Recording permission.

**Linux Wayland Handling.** On Linux running Wayland, screenshot capture requires a screenshot portal. If the portal is unavailable, the Agent operates in degraded mode without screenshots. The Agent detects Wayland vs X11 at startup and reports the degradation state in each heartbeat.

### Team Benchmarking

**Aggregate Benchmarking (Growth).** Managers can view aggregate productivity scores across teams and departments. Benchmarking data is aggregated only — individual employee scores are not visible to other team members. The benchmarking view shows team-level averages, trends, and distributions.

### REST API

Growth includes REST API access with a rate limit of 1,000 requests per hour. The API enables custom integrations, data export, and workflow automation. API documentation is provided after account creation. Authentication uses API keys generated from the organization settings page.

### In-App Chat Support

Growth plans include in-app chat support with a target response time of within four hours during business hours (Monday through Friday, 9 AM to 6 PM UTC).

---

## Enterprise — $24 per user per month

Everything in Growth, plus full configurability, advanced security controls, dedicated support, and compliance automation. Enterprise is for organizations with unlimited users that need maximum control over their monitoring infrastructure.

### Configurable Screenshot Interval

Enterprise plans allow the screenshot capture interval to be configured per organization or per team, from every one minute to every sixty minutes. All other screenshot features (redaction, encryption, exclusion list, manager-request viewing) are identical to Growth.

### Identifiable Team Benchmarking

Enterprise plans allow benchmarking to optionally show individual scores within a team, with employee consent where required by local regulation. All other benchmarking features (aggregate views, trend analysis) are identical to Growth.

### Higher API Rate Limit

Enterprise includes REST API access with a rate limit of 10,000 requests per hour — ten times the Growth limit.

### SSO and SAML 2.0 Integration

Enterprise supports single sign-on via SAML 2.0 compliant identity providers, including Okta, Azure Active Directory, and Google Workspace. SSO is configurable from the organization settings page.

### Custom Data Retention

Enterprise plans allow data retention periods to be configured per data type:
- Activity events
- Screenshots (metadata and files)
- Productivity scores
- Audit log entries
- Dispute records
- DSAR records

Automated deletion is enforced at the organization level. Data is permanently deleted at the end of the configured retention period with no grace period.

### Compliance Reports

Enterprise includes automated compliance report generation covering:
- Data processing activities
- Consent records and acknowledgment history
- Access logs (who viewed what data and when)
- Retention enforcement verification
- Dispute history and resolution status
- Score calculation audit trail (methodology version, inputs, outputs)

Reports are exportable in PDF and CSV formats.

### State Reporting and Drift Alerting (All Plans)

The Agent reports its actual enforced capture state in every heartbeat:
- Screenshots enabled/disabled
- Redaction active/inactive and version
- Exclusion list version
- Platform consent state (granted, denied, or MDM-overridden)
- URL capture mode (domain-only or full-path)
- Private Time active/inactive
- Degradation mode (none, no_window_title, wayland_unavailable, activity_only)
- Resource metrics (CPU percent, RAM in MB, uptime, thread count)

The server raises an admin-visible alert when the Agent's reported state drifts from the configured policy. Drift types include: screenshots disabled (policy requires them), redaction disabled, consent revoked, version mismatch on exclusion list or redaction version.

### Private Time Mode (All Plans)

Private Time is an employee-initiated mode that suppresses all capture — activity events, screenshots, and URLs — except session duration. Key characteristics:
- Initiated from the system tray (one click) or web portal
- Subject to configurable daily limits (default: 60 minutes max, 3 sessions max)
- Limits enforced locally by the Agent (even if the server is unreachable)
- Heartbeats continue during Private Time, reporting PRIVATE_TIME state
- System tray icon changes to indicate Private Time is active
- Employee dashboard shows "Private Time Active" with remaining allowance
- Termination happens on employee command, policy limit reached, or workstation lock
- Session record includes start time, end time, duration, and reason (manual/end/limit/lock)

### Dispute and Review Workflow (All Plans)

Employees can contest a productivity score or activity classification through a formal dispute workflow:
- Dispute includes: date range, category being disputed (application classification, time allocation, or score calculation), reason, and supporting evidence
- SLA of 5 business days tracked in-system with automatic escalation to HR on breach
- If upheld: score is recalculated for the affected date range and the historical record is visibly corrected
- Full audit trail of every dispute action is maintained
- Resolution history is available on the employee dashboard and admin panel

### Guided Setup Wizard

All plans include a guided setup wizard that enables a non-technical administrator to complete initial configuration in under 30 minutes. The wizard covers:
- Step 1 — Organization: name, jurisdiction, timezone
- Step 2 — Policy: select monitoring policy template (light, medium, comprehensive) or customize with a preview of what will be collected
- Step 3 — Users: invite users by email (single or bulk CSV) with role assignment (employee, manager, admin, compliance officer)
- Step 4 — Agent: download links for Windows, macOS, and Linux with a brief installation guide
- Step 5 — Confirm: summary of configured settings with "Go to Dashboard" button

Each step auto-saves; the admin can return later and resume. The system tracks time spent in the wizard and offers in-app help if the 30-minute target is exceeded. Setup can be skipped (expert mode) with a warning.

### Bulk User Provisioning

Enterprise plans (and optionally Growth) support bulk user provisioning via CSV upload. The CSV contains: name, email, and role. Validation errors are surfaced row by row. Invite emails are sent automatically. Maximum 500 rows per upload.

### Agent Deployment Options

- **Self-installation (all plans):** Employees install the Agent themselves. The installation process guides them through granting required OS permissions.
- **MDM deployment (Enterprise):** Administrators can deploy the Agent remotely using MDM tools such as Microsoft Intune, Jamf Pro, or similar solutions. A pre-configured package with organization enrollment token is available.
