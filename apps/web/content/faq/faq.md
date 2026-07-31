# Frequently Asked Questions

## General

### What is FSMS?

FSMS (Fair Screen Monitoring System) is a cloud-native workforce-analytics platform designed for small-to-medium businesses with 10 to 200 employees. It provides transparent employee activity monitoring with a published productivity scoring methodology, optional visual monitoring (growth and enterprise plans), and compliance governance tools including jurisdiction-aware notice templates, tamper-evident audit logging, and Data Subject Access Request (DSAR) workflows. FSMS is positioned explicitly as a workforce-analytics tool, not a security or DLP product, with trust-preserving defaults at every tier. The Agent is always visible and identifiable in the system tray and there is no stealth mode. See the [home page](/).

### Who is FSMS for?

FSMS is built for small-to-medium businesses with 10 to 200 employees who want visibility into how their teams work without deploying invasive surveillance tools. It is particularly suited for remote-first and hybrid teams, managers who need objective productivity data for coaching conversations rather than gut feel, and organizations that need compliance-ready monitoring controls under GDPR, the EU AI Act, or US state electronic monitoring statutes (Connecticut, New York, Delaware, Colorado). It is not designed for large enterprises (200+ employees), organizations requiring on-premise deployment, or use cases requiring keystroke logging or continuous video recording, as those are deliberate architectural exclusions.

### How is FSMS different from traditional employee monitoring?

Traditional monitoring tools collect as much data as possible, often operate without clear employee awareness, and provide managers with data that employees cannot see. FSMS takes the opposite approach: we collect only the minimum data needed for productivity analytics (application names, window titles, URL domains at 60-second heartbeat intervals), every employee can see their own data in real time through an identical dashboard, the Agent is always visible and identifiable in the system tray, and we never log keystrokes or record audio or video. Our productivity scoring methodology is published and visible to every employee. Our screenshot monitoring requires explicit manager request to view and screenshots are redacted by default. See [Why FSMS](/why-fsms) for a detailed comparison.

### Is FSMS legal?

Yes, FSMS is designed to comply with applicable laws in the jurisdictions we operate in, including the GDPR in the European Union, the EU AI Act, and US state electronic monitoring statutes such as Connecticut General Statute Section 31-48d, New York Labor Law Section 52-c, Delaware Title 19 Section 705, and Colorado Revised Statute Section 8-2-127. Employers are responsible for providing notice to employees as required by applicable law, and FSMS provides the consent management, policy acknowledgment, and jurisdiction-aware notice templates to support this. See our [Compliance page](/compliance) for details.

### Which jurisdictions does FSMS support?

FSMS provides jurisdiction-aware compliance controls for the European Union (GDPR and EU AI Act), Connecticut (CGS § 31-48d), New York (NY Lab. Law § 52-c), Delaware (DE Title 19 § 705), Colorado (CO Rev. Stat. § 8-2-127), and a general "other" category for jurisdictions not specifically listed. The jurisdiction-aware notice engine selects the appropriate policy template based on the organization's registered jurisdiction at setup. Additional jurisdictions are added as regulatory requirements evolve.

### What happens during the 14-day free trial?

All plans include a 14-day free trial with full access to all features of the chosen plan. No credit card is required. At the end of the trial period, you are prompted to choose a plan and provide payment information. All data collected during the trial is preserved if you convert to a paid plan. During the trial, you have access to the full feature set of the plan you selected, including Agent installation for all users, the employee dashboard, productivity scoring, and (on Growth or Enterprise trials) screenshot monitoring.

### Does FSMS ever log keystrokes?

No. FSMS never logs keystrokes, key counts, or any form of keyboard input content. This is a deliberate architectural constraint that applies at every tier, now and in all future versions. Keystroke logging is incompatible with FSMS's data minimization principle and its compliance positioning under the EU AI Act. This is an explicit product exclusion (see SRS §1.2.3).

### Can the Agent run in stealth mode?

No. The FSMS Agent is always visible and identifiable on the employee's workstation. The Agent icon appears in the system tray or menu bar on Windows, macOS, and Linux with a clear indicator showing whether it is actively capturing data or in Private Time. There is no stealth mode, hidden capture, or covert monitoring capability in any FSMS plan. This is a design requirement, not a configuration option (see SRS §1.2.3).

### Which operating systems does the Agent support?

The FSMS Agent supports Windows 10 and 11, macOS Ventura (14) and later, and major Linux distributions including Ubuntu 22.04 and later. The Agent is a native application on each platform. On macOS, screenshot capture requires Screen Recording permission via the TCC (Transparency, Consent, and Control) framework which can be pre-approved via MDM using a PPPC profile. On Linux, screenshot capture on Wayland requires a screenshot portal; if the portal is unavailable, the Agent operates in degraded mode without screenshots and reports the degradation state in each heartbeat.

## Privacy and Data

### What data does the FSMS Agent collect?

The FSMS Agent collects:
- **Application usage**: application name, executable path, process ID, active time at 60-second heartbeat intervals
- **Window titles**: active window title text
- **URL visits**: browser domain (default) or full URL path (opt-in, configured at policy level)
- **Activity states**: ACTIVE, PASSIVE (passive-attention), IDLE, and PRIVATE_TIME state transitions
- **USB device events**: device connection/disconnection events (identifiers only, no content)
- **File operations**: file creation, rename, and deletion events (path only, no content)

On Growth and Enterprise plans, the Agent also captures periodic screenshots (JPEG at quality 80, EXIF-stripped, encrypted, and redacted by default). The Agent does not log keystrokes, record audio or video, access files, monitor network traffic, or collect webcam or microphone data. See the [Compliance page](/compliance) for a complete data collection table.

### What data does FSMS deliberately NOT collect?

FSMS explicitly does not collect: keystrokes or keyboard input content, audio (no microphone access), video (no webcam access), continuous screen recordings (periodic screenshots only), network traffic content, email content, file contents (paths only), biometric data (fingerprints, facial recognition), location data (GPS or IP geolocation), social media activity, or any data from non-work devices. These are architectural constraints, not configuration options, and apply at all tiers.

### Can employees see their own data?

Yes. Every employee has access to their own FSMS dashboard, which shows the same activity timeline, productivity score, confidence indicator, trend data, and breakdown that their manager sees. There is no data hidden from employees. The employee dashboard also includes a complete access log showing who has viewed their data and when. The dashboard updates in real-time via SSE (Server-Sent Events) and data refreshes every 60 seconds. See the [Features page](/features) for dashboard details.

### What is Private Time mode?

Private Time is an employee-initiated mode that suppresses all capture — activity events, screenshots, and URLs — except session duration tracking. When Private Time is active, the Agent stops collecting all data except start time, end time, and total duration. Heartbeats continue during Private Time reporting the PRIVATE_TIME state. The system tray icon changes to indicate Private Time. Private Time is initiated from the system tray (one click) or web portal. Daily limits are configurable (default: 60 minutes max, 3 sessions max) and are enforced locally by the Agent — even if the server is unreachable, Private Time ends when the limit is reached. Private Time terminates on employee command, policy limit reached, or workstation lock. Private Time time is excluded from all productivity calculations.

### How does screenshot redaction work?

Screenshots are redacted client-side before upload to the server. The Agent performs OCR-based heuristic detection for password fields, credit card numbers, and other sensitive fields and redacts them before the screenshot is transmitted. If the foreground application is in the sensitive-app exclusion list, the Agent either redacts the entire screenshot or skips capture entirely. If redaction fails (e.g., the OCR library is unavailable), the screenshot is not uploaded. After upload, screenshots are stored in an encrypted state (SSE-S3 or equivalent AES-256 with per-file keys). By default, screenshots are visible only as blurred thumbnails. A manager must actively request to view a specific screenshot; the request is logged in the tamper-evident audit trail, and the employee receives a notification. Screenshots are never used for automated analysis, flagging, or alerting.

### What is the sensitive-app exclusion list?

The sensitive-app exclusion list is a configurable organization-level list of applications that should never be screenshotted. It supports three match types: executable name (e.g., `1Password.exe`, `LastPass.app`), window title substring (e.g., "Chase Bank", "Wells Fargo Online"), and browser domain (e.g., `chase.com`, `bankofamerica.com`). The default exclusion list includes common password managers (1Password, LastPass, Bitwarden, KeePass) and major banking domains. When an excluded app is in the foreground, the Agent either skips capture entirely or fully redacts the screenshot (configurable). The exclusion list version is reported in every heartbeat, and list updates are pushed to all agents within 5 minutes.

### How is data encrypted?

All data in transit between the Agent and the server uses TLS 1.3. All data at rest in the server database uses AES-256 encryption. Screenshots use per-file encryption keys that are stored separately from the screenshot data (SSE-S3 or equivalent). The Agent's local offline cache uses AES-256 encryption via SQLCipher with a device-specific encryption key derived from the enrollment token — this key is never transmitted to the server. OAuth tokens for calendar integration are encrypted at rest (AES-256) per employee record. API keys are hashed before storage using bcrypt. No encryption keys are hardcoded in the Agent binary or in any repository code.

### What happens if the Agent loses connectivity?

The Agent caches activity data locally in an encrypted SQLite database (AES-256 via SQLCipher, device-specific key, maximum 50 MB, 7-day TTL). It continues to capture and store data until connectivity is restored. When the connection is reestablished, the Agent syncs all cached data to the server in capture-time order using exponential backoff retry (30s, 60s, 120s, 300s, 600s — capped at 10-minute intervals). The local cache is automatically cleared after successful sync. Sync failures past the retry threshold trigger a quarantine state visible to administrators. The maximum offline cache duration is 7 days per the TTL policy.

## Plans and Billing

### What are the FSMS pricing plans?

FSMS offers three tiered plans: Starter ($6 per user per month), Growth ($12 per user per month), and Enterprise ($24 per user per month). Annual billing is available at a discount of two months per year: Starter at $60 per user per year ($5/mo), Growth at $120 per user per year ($10/mo), and Enterprise at $240 per user per year ($20/mo). Starter supports up to 10 users with email support. Growth supports up to 50 users with in-app chat support and adds screenshot monitoring at a 10-minute interval, aggregate team benchmarking, and API access (1,000 requests/hour). Enterprise has unlimited users with configurable screenshot intervals (1–60 minutes), identifiable benchmarking (with consent), 10,000 API requests/hour, SSO/SAML 2.0, custom data retention, compliance reports, dedicated account manager, and 24/7 support for critical issues. See the [Pricing page](/pricing) for the full comparison table.

### What happens if I exceed my user limit?

When your organization reaches 90% of your plan's user limit, all organization administrators receive a notification. If you exceed the limit, new Agent installations are blocked and existing Agents continue to function normally. You will be prompted to upgrade to the next tier. Additional user seats beyond a plan's limit are not available — you must upgrade to a higher tier. Starter supports up to 10 users, Growth supports up to 50 users, and Enterprise has no user limit.

### Can I switch plans mid-cycle?

Yes, you can upgrade or downgrade at any time. Plan changes take effect at the start of the next billing cycle. Charges are prorated for the remainder of the current billing cycle. Feature access during the current cycle remains at your existing plan level until the change takes effect. Data collected during the current cycle is preserved and remains accessible after the plan change, subject to the new plan's feature boundaries and retention policies.

### Is there an annual billing discount?

Yes, annual billing is available at a discount of two months per year (pay for 10 months, get 2 months free). Annual Starter is $60 per user per year ($5 per user per month). Annual Growth is $120 per user per year ($10 per user per month). Annual Enterprise is $240 per user per year ($20 per user per month). Annual plans are billed once per year. No partial refunds are given for mid-cycle downgrades under annual billing.

### How is billing calculated per user?

Billing is calculated per active user per month. An active user is any employee who has the FSMS Agent installed and has sent at least one data heartbeat in the billing period. Employees who have not sent a heartbeat for 30 consecutive days are classified as inactive and are not billed. Billing is calculated at the end of each billing period based on the average number of active users during that period. Billing begins after the 14-day free trial ends. There are no setup fees or hidden charges.

### Do you offer discounts for non-profits or educational institutions?

Yes, FSMS offers a 20% discount for verified non-profit organizations and accredited educational institutions. The discount applies to both monthly and annual billing on all plans. Contact sales@fsms.dev with your verification documents to have the discount applied to your account.

### What payment methods do you accept?

FSMS accepts major credit and debit cards (Visa, Mastercard, American Express, Discover). Enterprise plans may be eligible for invoicing (net-30 terms) for annual contracts. Contact sales@fsms.dev for invoicing inquiries.

## Technical

### What are the minimum system requirements for the Agent?

The FSMS Agent requires less than 50 MB of disk space and uses negligible CPU and memory during normal operation (typically under 0.5% CPU and 50 MB RAM). A modern dual-core processor and 4 GB of RAM are sufficient. The Agent runs as a background service and does not significantly impact system performance. The Agent reports its resource consumption (CPU percent, RAM in MB, uptime, thread count) in every heartbeat for monitoring.

### How long does deployment take?

A typical FSMS deployment takes less than one day. After creating an organization account, the guided setup wizard (5 steps, under 30 minutes) configures the organization, selects a policy template, invites users, and provides Agent download links. Employees install the Agent, grant required OS permissions (Accessibility API on macOS, for example), and appear in the dashboard within minutes of the first heartbeat. No server setup, configuration files, or IT infrastructure changes are needed. Enterprise plans support MDM deployment (Microsoft Intune, Jamf Pro) for remote Agent installation.

### Can employees install the Agent themselves?

Yes, employees can install the FSMS Agent themselves on all plans. The installation process guides them through granting the required operating system permissions (Accessibility API on macOS, for example). For Enterprise plans, administrators can deploy the Agent remotely using MDM tools such as Microsoft Intune, Jamf Pro, or similar solutions with a pre-configured package containing the organization enrollment token.

### How does the Agent detect idle states?

The Agent uses a configurable idle threshold (default: 180 seconds of inactivity). When keyboard or mouse input stops for longer than the threshold, the Agent transitions from ACTIVE to IDLE. If a meeting is detected via calendar integration (Google Calendar or Outlook OAuth 2.0) or heuristic window analysis (detecting Zoom, Microsoft Teams, or Google Meet windows), the Agent transitions to PASSIVE-ATTENTION instead of IDLE. Passive-attention time is not penalized in productivity scoring. The Agent also supports Private Time, which supersedes all idle detection.

### Do you have a public API?

Yes, FSMS provides a REST API for custom integrations, data export, and workflow automation. API access is included in Growth (1,000 requests per hour) and Enterprise (10,000 requests per hour) plans. API documentation with request/response schemas, example requests, and error codes is provided after account creation. Authentication uses API keys generated from the organization settings page, sent as bearer tokens in the `Authorization: Bearer <api_key>` header. Keys can be rotated or revoked at any time.

### How does meeting-aware idle detection work?

FSMS integrates with Google Calendar and Outlook via OAuth 2.0 to detect scheduled meetings. When an employee has a calendar event during work hours, the Agent records the time as PASSIVE-ATTENTION rather than IDLE, even without keyboard or mouse input. This prevents legitimate meeting time from being penalized in productivity scoring. Calendar data access is read-only — FSMS never creates, modifies, or deletes calendar events. OAuth tokens are encrypted at rest (AES-256) and associated with the individual employee record.

### What integrations are available?

FSMS currently integrates with Slack (productivity summaries, Private Time control, notifications), Jira Cloud (project-level productivity trends), Asana (project-level focus time analysis), Google Calendar and Outlook (meeting-aware idle detection), and provides a REST API for custom integrations. Planned integrations include GitHub, GitLab, HubSpot, Salesforce, and Microsoft Teams. See the [Integrations page](/integrations) for full details.

## Setup and Onboarding

### How do I get started with FSMS?

1. Create an account and select a plan (14-day free trial, no credit card required).
2. Complete the guided setup wizard (under 30 minutes): configure your organization name, jurisdiction, and timezone; select a monitoring policy template (light, medium, or comprehensive) or customize; invite users by email (single or bulk CSV with up to 500 rows); and provide Agent download links for Windows, macOS, and Linux.
3. Employees install the Agent and grant required OS permissions.
4. The first heartbeat appears in the dashboard within 60 seconds of Agent installation.
5. Managers can view the team dashboard, productivity scores, and activity logs immediately. On Growth and Enterprise, screenshot monitoring begins automatically at the configured interval.
6. Employees can access their personal dashboard through the web portal to view their data, start Private Time, file disputes, or export their data.

### Is training included?

Starter and Growth plans include access to the FSMS documentation library and video tutorials covering Agent installation, dashboard navigation, and configuration. Enterprise plans include a dedicated onboarding session with a customer success manager, customized training materials for managers and employees (including best-practice guides for introducing monitoring transparently to your team), and ongoing priority support.

### Can the Agent be deployed via MDM?

Yes, on Enterprise plans, administrators can deploy the Agent remotely using MDM tools such as Microsoft Intune (Windows), Jamf Pro (macOS), or similar solutions. A pre-configured package with the organization enrollment token is provided. On macOS, a PPPC (Privacy Preferences Policy Control) profile can be deployed to pre-approve the Screen Recording permission required for screenshot capture. On Windows and Linux, installation does not require pre-approval of permissions beyond standard user consent.

### What happens when an employee leaves the organization?

When an employee is deactivated in the FSMS admin dashboard:
- The Agent on their workstation is remotely disabled on the next heartbeat
- Their data is retained according to the organization's configured retention policy
- Their user record is preserved in the audit trail for compliance purposes
- Their dashboard access is revoked
- A DSAR export of their data can be provided on request

Data retention and deletion follow the organization's configured retention periods, with a minimum 30-day grace period after account cancellation before permanent deletion.

### Is there a setup wizard?

Yes, all plans include a guided setup wizard that enables a non-technical administrator to complete initial configuration in under 30 minutes. The wizard has 5 steps: Organization (name, jurisdiction, timezone), Policy (template selection or customization with preview), Users (single or bulk CSV invitation with role assignment), Agent (download links with installation guide), and Confirm (settings summary with "Go to Dashboard"). Each step auto-saves so the admin can return later. The system tracks time spent and offers help if the 30-minute target is exceeded. Setup can be skipped (expert mode) with a warning.

### How do I contact support?

Support channels depend on your plan. Starter plans have email support (support@fsms.dev) with a target response time of within one business day during business hours. Growth plans include in-app chat support with a target response time of within four hours during business hours. Enterprise plans include a dedicated account manager and priority support with one-hour response during business hours plus 24/7 coverage for critical issues. All plans can reach sales at sales@fsms.dev and privacy/compliance at privacy@fsms.dev.
