export type Integration = {
  id: string;
  handle: string;
  name: string;
  tag: string;
  plans: string;
  summary: string;
  points: string[];
  setup?: string;
};

export const integrations: Integration[] = [
  {
    id: "slack",
    handle: "slack",
    name: "Slack",
    tag: "Insights where you already work",
    plans: "All plans",
    summary:
      "Productivity insights delivered directly into your communication workflow, for managers and employees.",
    points: [
      "Managers receive daily productivity summaries, anomaly alerts, and team benchmarking reports",
      "Employees can check their score, view their activity timeline, and start or stop Private Time",
      "Notifications when a manager views a screenshot, and dispute resolution updates",
      "Configure metrics and frequency — daily, weekly, or real-time for critical alerts",
    ],
    setup: "Setup takes less than five minutes · supports multiple workspaces",
  },
  {
    id: "jira",
    handle: "jira",
    name: "Jira",
    tag: "Activity correlated to the ticket",
    plans: "All plans",
    summary:
      "Correlates activity data with project tickets to give productivity metrics real context.",
    points: [
      "Maps tracked application and URL activity to Jira projects and issues",
      "Productivity trends per project, per sprint, or per team member",
      "Sprint-level trends for agile teams, and a read on context-switching",
    ],
    setup: "Requires Jira Cloud and admin access · reads metadata only, never writes",
  },
  {
    id: "asana",
    handle: "asana",
    name: "Asana",
    tag: "Project-level productivity",
    plans: "All plans",
    summary:
      "Tracks project-level productivity trends and helps identify workload imbalances.",
    points: [
      "Syncs project and task data so every activity event carries project context",
      "Project leads see which projects consume the most focus time",
      "Identifies tasks that may need redistribution across team members",
    ],
    setup: "Respects Asana's privacy settings — never accesses tasks marked as private",
  },
  {
    id: "google-calendar",
    handle: "calendar",
    name: "Google Calendar",
    tag: "Meeting-aware, not meeting-penalized",
    plans: "All plans",
    summary:
      "Enables meeting-aware idle detection and automatic Private Time scheduling.",
    points: [
      "Calendar events during work hours are recorded as PASSIVE-ATTENTION rather than IDLE",
      "Time marked as \"Focusing\" in the calendar activates Private Time automatically",
      "Works with Google Workspace and Microsoft 365 (Outlook) calendars",
    ],
    setup: "Read-only OAuth 2.0 — never creates, modifies, or deletes events",
  },
  {
    id: "rest-api",
    handle: "api",
    name: "REST API",
    tag: "Custom integrations and data export",
    plans: "Growth + Enterprise",
    summary:
      "Access to the Veracity REST API for custom integrations, data export, and workflow automation.",
    points: [
      "Rate limits of 1,000 requests per hour on Growth and 10,000 on Enterprise",
      "Bearer-token authentication with keys generated and revoked from Organization Settings",
      "Endpoints for activity data, scores, benchmarking, disputes, and Private Time records",
    ],
    setup: "Full documentation at docs.veracity.dev/api after account creation",
  },
];

export const roadmap = [
  {
    name: "GitHub and GitLab",
    tag: "Correlate activity with development activity",
  },
  {
    name: "HubSpot and Salesforce",
    tag: "Correlate activity with CRM workflows",
  },
  {
    name: "Microsoft Teams",
    tag: "Meeting detection and notifications within Teams",
  },
];

export const endpoints = [
  "Employee activity data — applications, URLs, time allocation",
  "Productivity scores — individual and team aggregate",
  "Screenshot metadata (screenshot files require manager request through the web portal)",
  "Team benchmarking data",
  "Dispute submission and status",
  "Private Time session records",
  "Organization policy configuration and user management (admin only)",
  "Audit log queries (admin only)",
  "Compliance report generation (Enterprise only)",
];
