---
title: Integrations
slug: integrations
order: 7
---

# Veracity Integrations — Connect Your Workflow

Veracity connects with the tools your team already uses. Our integrations enrich productivity data with context from your existing workflow, enabling more accurate activity classification and richer analytics. All integrations described here are included in every Veracity plan unless otherwise noted.

---

## Slack

The Veracity Slack integration brings productivity insights directly into your communication workflow.

**For Managers.** Receive daily productivity summaries, anomaly alerts (significant score changes or drift events), and team benchmarking reports directly in your Slack workspace. Managers can configure which metrics are shared and how frequently summaries are sent — daily, weekly, or real-time for critical alerts.

**For Employees.** Employees can use the Veracity Slack app to:
- Check their current productivity score
- View their activity timeline
- Start and stop Private Time
- Receive notifications when a manager views their screenshot
- Receive dispute resolution updates

**Setup.** Setup takes less than five minutes. Authenticate with your Slack workspace using OAuth, configure notification preferences, and choose which Slack channels receive team reports. The integration supports multiple workspaces.

## Jira

The Veracity Jira integration correlates activity data with project tickets to give context to productivity metrics.

**Capabilities.**
- Maps tracked application and URL activity to Jira projects and issues
- Enables managers to view productivity trends per project, per sprint, or per team member
- Helps identify whether time is being spent on priority tasks or whether context-switching is reducing focus
- Shows sprint-level productivity trends for agile teams

**Requirements.** The integration requires a Jira Cloud subscription and admin access to configure the connection. Jira Data Center and Jira Server are not supported.

**Data Flow.** The integration reads issue and project metadata to associate activity events with tickets. Veracity does not write to Jira — no issues are created, modified, or deleted by the integration.

## Asana

The Veracity Asana integration tracks project-level productivity trends and helps identify workload imbalances.

**Capabilities.**
- Syncs project and task data to give each activity event a project context
- Project leads can see which projects are consuming the most focus time
- Identifies tasks that may need redistribution across team members
- Shows project-level productivity trends over time

**Privacy.** The integration respects Asana's privacy settings and does not access tasks marked as private. Only project and task metadata visible to the authenticated user is accessible.

## Google Calendar

The Veracity Google Calendar integration enables meeting-aware idle detection and automatic Private Time scheduling.

**Meeting-Aware Idle Detection.** When an employee has a calendar event during work hours, Veracity records the time as PASSIVE-ATTENTION rather than IDLE. This prevents legitimate meeting time from being penalized in productivity scoring. The detection works with Google Calendar and Outlook calendars.

**Automatic Private Time Scheduling.** Employees who mark time as "Focusing" in Google Calendar will have Private Time activated automatically for the duration of the event. This allows employees to designate deep-focus periods where all capture is paused.

**Read-Only Access.** Calendar data is read-only. Veracity never creates, modifies, or deletes calendar events. OAuth tokens for calendar access are encrypted at rest (AES-256) and associated with the employee record.

**Setup.** Employees connect their calendar through the Veracity employee dashboard using OAuth 2.0. The integration supports Google Workspace and Microsoft 365 (Outlook) calendars.

## REST API

All Growth and Enterprise plans include access to the Veracity REST API for custom integrations, data export, and workflow automation.

### Rate Limits

- **Growth:** 1,000 requests per hour
- **Enterprise:** 10,000 requests per hour

### Authentication

API authentication uses API keys generated from the Organization Settings page. API keys are bearer tokens sent in the `Authorization: Bearer <api_key>` header. Keys can be rotated or revoked at any time from the same settings page.

### Available Endpoints

The API provides access to:
- Employee activity data (applications, URLs, time allocation)
- Productivity scores (individual and team aggregate)
- Screenshot metadata (not screenshot files — those require manager request through the web portal)
- Team benchmarking data
- Dispute submission and status
- Private Time session records
- Organization policy configuration (admin only)
- User management (admin only)
- Audit log queries (admin only)
- Compliance report generation (Enterprise only)

### Documentation

Full API documentation with request/response schemas, example requests, and error codes is provided after account creation. The documentation is available at `https://docs.veracity.dev/api`.

## Planned Integrations (Roadmap)

The following integrations are on the Veracity roadmap but not yet available:
- **GitHub and GitLab** — correlate activity data with development activity
- **HubSpot and Salesforce** — correlate activity with CRM workflows
- **Microsoft Teams** — meeting detection and notifications within Teams

Integration priorities are driven by customer demand. Contact sales@veracity.dev to request an integration.
