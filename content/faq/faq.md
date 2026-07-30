# Frequently Asked Questions

## General

### Q: What is FSMS?

FSMS, which stands for Fair Screen Monitoring System, is a workforce-analytics platform for small-to-medium businesses with ten to two hundred employees. It provides transparent employee activity monitoring with productivity scoring, optional visual monitoring, and compliance governance tools. FSMS is designed to give managers productivity data without creating a surveillance culture.

### Q: Who is FSMS for?

FSMS is built for small-to-medium businesses with ten to two hundred employees who want visibility into how their teams work without deploying invasive surveillance tools. It is particularly suited for remote-first and hybrid teams, managers who need objective productivity data for coaching conversations, and organizations that need compliance-ready monitoring controls.

### Q: How is FSMS different from traditional employee monitoring?

Traditional monitoring tools collect as much data as possible and often operate without clear employee awareness. FSMS takes the opposite approach: we collect only the minimum data needed for productivity analytics, every employee can see their own data in real time, the Agent is always visible and identifiable in the system tray, and we never log keystrokes or record audio or video. We publish our productivity scoring methodology, and our screenshot monitoring is opt-in with employee notification on every capture.

### Q: Is FSMS legal?

Yes, FSMS is designed to comply with applicable laws in the jurisdictions we operate in, including the GDPR in the European Union, the EU AI Act, and relevant US state electronic monitoring statutes such as Connecticut General Statute Section 31-48d and New York Labor Law Section 52-c. Employers are responsible for providing notice to employees as required by applicable law, and FSMS provides the consent management and policy acknowledgment tools to support this.

### Q: Which jurisdictions does FSMS comply with?

FSMS is designed for compliance with the GDPR (European Union), the EU AI Act, and US state electronic monitoring laws including Connecticut and New York. Our compliance infrastructure includes jurisdiction-aware notice engines, tamper-evident audit logging, configurable data retention with automated deletion, and Data Subject Access Request workflows. We continue to monitor regulatory developments and update our compliance controls accordingly.

## Privacy and Data

### Q: What data does the FSMS Agent collect?

The FSMS Agent collects application usage data (application name, window title, active time), URL visits from supported browsers, and system state including idle and active status. Data is captured at sixty-second heartbeat intervals. On Growth and Enterprise plans, the Agent also captures periodic screenshots at configured intervals. The Agent does not log keystrokes, record audio or video, access files, monitor network traffic, or collect webcam or microphone data.

### Q: Can employees see their own data?

Yes, every employee has access to their own FSMS dashboard, which shows the same activity timeline, productivity score, and trend data that their manager sees. There is no data hidden from employees. The employee dashboard also includes a complete access log showing who has viewed their data and when.

### Q: What is Private Time mode?

Private Time is an employee-initiated feature that pauses all data capture except session duration. When Private Time is active, the Agent stops collecting application usage, URLs, and screenshots. Only the start time, end time, and total duration of the Private Time session are recorded. Managers see that Private Time was used but not what the employee did during that period. Employees can activate Private Time with one click from the system tray icon or the FSMS dashboard.

### Q: How does screenshot redaction work?

Screenshots are encrypted at the point of capture and stored in encrypted form. By default, screenshots are in a redacted state visible only as blurred thumbnails. A manager must actively request to view a specific screenshot, and the request is logged in the audit trail. When a screenshot is viewed, the employee receives a notification. Screenshots are never used for automated analysis, flagging, or alerting.

### Q: Does FSMS ever log keystrokes?

No. FSMS never logs keystrokes, key counts, or any form of keyboard input. This is a deliberate architectural constraint that applies at every tier, now and in all future versions. Keystroke logging is incompatible with our data minimization principle and our compliance positioning under the EU AI Act.

### Q: Can the Agent run in stealth mode?

No. The FSMS Agent is always visible and identifiable on the employee's workstation. The Agent icon appears in the system tray with a clear indicator showing whether it is actively capturing data. There is no stealth mode, hidden capture, or covert monitoring capability in any FSMS plan. This is a design requirement, not a configuration option.

## Plans and Billing

### Q: What happens if I exceed my user limit?

When your organization reaches ninety percent of your plan's user limit, all organization administrators receive a notification. If you exceed the limit, new Agent installations are blocked and existing Agents continue to function. You will be prompted to upgrade to the next tier. Additional user seats beyond a plan's limit are not available — you must upgrade to a higher tier.

### Q: Can I switch plans mid-cycle?

Yes, you can upgrade or downgrade at any time. Plan changes take effect at the start of the next billing cycle. Charges are prorated for the remainder of the current billing cycle. Feature access during the current cycle remains at your existing plan level until the change takes effect.

### Q: Is there an annual billing discount?

Yes, annual billing is available at a discount of two months per year. Annual Starter is sixty dollars per user per year, which works out to five dollars per user per month. Annual Growth is one hundred twenty dollars per user per year, or ten dollars per user per month. Annual Enterprise is two hundred forty dollars per user per year, or twenty dollars per user per month.

### Q: How is billing calculated per user?

Billing is calculated per active user per month. An active user is any employee who has the FSMS Agent installed and has sent at least one data heartbeat in the billing period. Employees who have not sent a heartbeat for thirty consecutive days are classified as inactive and are not billed. Billing is calculated at the end of each billing period based on the average number of active users during that period.

### Q: Do you offer discounts for non-profits or educational institutions?

Yes, we offer a twenty percent discount for verified non-profit organizations and accredited educational institutions. Contact our sales team at sales@fsms.dev with your verification documents to get the discount applied to your account.

## Technical

### Q: Which operating systems does the Agent support?

The FSMS Agent supports Windows 10 and 11, macOS Ventura and later, and Ubuntu 22.04 and later and other major Linux distributions. The Agent is a native application on each platform and uses the operating system's accessibility and permission frameworks to collect activity data with appropriate user consent.

### Q: What are the minimum system requirements?

The FSMS Agent requires less than fifty megabytes of disk space and uses negligible CPU and memory during normal operation. A modern dual-core processor and four gigabytes of RAM are sufficient. The Agent runs as a background service and does not significantly impact system performance.

### Q: What happens if the Agent loses connectivity?

The Agent caches activity data locally using AES-256 encryption. It continues to capture and store data until connectivity is restored. When the connection is reestablished, the Agent syncs all cached data to the server in order of capture time. The local cache is automatically cleared after successful sync. The maximum offline cache duration is seven days.

### Q: How is data encrypted?

All data in transit is encrypted using TLS 1.3. All data at rest in the server database is encrypted using AES-256. Screenshots use per-file encryption keys that are stored separately from the screenshot data. The Agent's local cache uses AES-256 encryption with a device-specific key that is never transmitted to the server.

### Q: Do you have a public API?

Yes, FSMS provides a REST API for custom integrations and data export. API access is included in Growth and Enterprise plans. The Growth plan includes one thousand requests per hour, and the Enterprise plan includes ten thousand requests per hour. API documentation is provided after account creation. Authentication uses API keys generated from the organization settings page.

## Setup and Onboarding

### Q: How long does deployment take?

A typical FSMS deployment takes less than one day. After creating an organization account, you generate installation links or packages for your team's operating systems. Employees install the Agent, grant the required permissions, and appear in the dashboard within minutes of the first heartbeat. No server setup, configuration files, or IT infrastructure changes are needed.

### Q: Can employees install the Agent themselves?

Yes, employees can install the FSMS Agent themselves. The installation process guides them through granting the required operating system permissions. For Enterprise plans, administrators can deploy the Agent remotely using MDM tools such as Microsoft Intune, Jamf Pro, or a similar solution.

### Q: Is training included?

Starter and Growth plans include access to our documentation library and video tutorials. Enterprise plans include a dedicated onboarding session with a customer success manager, customized training materials for managers and employees, and access to best-practice guides for introducing monitoring transparently to your team.
