export type Tier = "all" | "growth" | "enterprise";

export type FeatureEntry = {
  id: string;
  name: string;
  desc: string;
  tier: Tier;
  specs: string[];
  refusal?: string;
};

export type Capability = {
  id: string;
  name: string;
  lead: string;
  entries: FeatureEntry[];
};

export const tierLabel: Record<Tier, string> = {
  all: "All plans",
  growth: "Growth and above",
  enterprise: "Enterprise",
};

export const capabilities: Capability[] = [
  {
    id: "track",
    name: "Track",
    lead: "What the Agent captures, how often, and what happens when the connection drops. Every rule is visible to the employee before it applies to them.",
    entries: [
      {
        id: "activity-tracking",
        name: "Activity Tracking",
        desc: "The Agent logs the active application name, executable path, process ID, and window title at sixty-second heartbeat intervals. Browser URLs are captured as domains by default; full-path capture is an optional policy setting that is reported in every heartbeat and visible to the employee in their activity log. When a window title can't be read, the Agent reports a degradation state and keeps capturing everything it can.",
        tier: "all",
        specs: ["HEARTBEAT 60s", "URLS AS DOMAINS BY DEFAULT", "DEGRADATION REPORTED"],
      },
      {
        id: "app-categorization-engine",
        name: "App Categorization Engine",
        desc: "Applications and websites are classified as Productive, Neutral, or Unproductive by a configurable engine, with a confidence level on every decision. A manager override triggers an automatic score recalculation for the affected date range, and every decision — default, override, or ambiguity flag — is written to the audit trail.",
        tier: "all",
        specs: ["3 CATEGORIES", "CONFIDENCE: CERTAIN / UNCERTAIN", "OVERRIDES RECALCULATE SCORES"],
      },
      {
        id: "meeting-aware-idle-detection",
        name: "Meeting-Aware Idle Detection",
        desc: "Google Calendar and Outlook integrations mark meeting time as PASSIVE-ATTENTION instead of IDLE, so legitimate meetings are never miscategorized or penalized in scoring. Calendar access is read-only — Veracity never creates, modifies, or deletes events — and OAuth tokens are encrypted at rest.",
        tier: "all",
        specs: ["PASSIVE-ATTENTION, NOT IDLE", "GOOGLE CALENDAR + OUTLOOK", "READ-ONLY · TOKENS ENCRYPTED"],
      },
      {
        id: "private-time-mode",
        name: "Private Time Mode",
        desc: "An employee-initiated pause that suppresses all capture — activity events, screenshots, and URLs — except session duration. Limits are enforced locally by the Agent, even if the server is unreachable, and the session ends on employee command, policy limit, or workstation lock.",
        tier: "all",
        specs: ["CAPTURE PAUSED · DURATION ONLY", "DEFAULT 60 MIN · 3 SESSIONS", "ENFORCED EVEN OFFLINE"],
      },
    ],
  },
  {
    id: "understand",
    name: "Understand",
    lead: "How activity becomes insight. The employee sees the same numbers their manager sees, computed from the same published method.",
    entries: [
      {
        id: "productivity-scoring",
        name: "Productivity Scoring",
        desc: "A daily 0–100 score, calculated at midnight local time from the published formula above. The score is null — not zero — when there is insufficient data, it is capped at 100, and every record stores the methodology version for audit traceability.",
        tier: "all",
        specs: ["SCORED DAILY · MIDNIGHT LOCAL", "NULL WHEN NO ACTIVE TIME", "METHODOLOGY VERSION AUDITED"],
        refusal: "No accuracy-percentage claims, anywhere. The published methodology is the only accuracy representation.",
      },
      {
        id: "employee-dashboard",
        name: "Employee Dashboard",
        desc: "Every employee sees exactly the same data their manager sees — daily score with confidence indicator, a real-time activity timeline, trend history, peak productivity hours, personal baseline comparison, Private Time status, and a complete access log showing who viewed their data and when.",
        tier: "all",
        specs: ["SAME VIEW AS MANAGER", "REFRESHES EVERY 60s VIA SSE", "FULL ACCESS LOG"],
      },
      {
        id: "team-benchmarking",
        name: "Team Benchmarking",
        desc: "Managers compare aggregate productivity across teams and departments — averages, trends, and distributions, with no individual scores visible to other team members. Enterprise can optionally surface individual scores within a team, with employee consent where local regulation requires it.",
        tier: "growth",
        specs: ["AGGREGATE BY DEFAULT", "ENTERPRISE: IDENTIFIABLE WITH CONSENT"],
      },
      {
        id: "guided-setup-wizard",
        name: "Guided Setup Wizard",
        desc: "A five-step wizard walks a non-technical administrator through organization, policy, users, agent installation, and confirmation — in under 30 minutes, with auto-save so it can be resumed later. Expert mode skips the wizard with a warning.",
        tier: "all",
        specs: ["5 STEPS · UNDER 30 MIN", "AUTO-SAVES", "EXPERT MODE AVAILABLE"],
      },
    ],
  },
  {
    id: "control",
    name: "Control",
    lead: "The levers administrators and employees hold over monitoring: what gets captured, who can look, and how disputes are settled. Transparency here is the product, not a policy.",
    entries: [
      {
        id: "screenshot-monitoring",
        name: "Screenshot Monitoring",
        desc: "Optional periodic screenshots at a fixed ten-minute interval on Growth, or a configurable one-to-sixty-minute interval on Enterprise. Every capture is redacted client-side before upload — OCR heuristics mask password and credit-card fields — and apps on the sensitive-app exclusion list are skipped entirely. A manager must actively request to view a screenshot; the request is logged and the employee is notified.",
        tier: "growth",
        specs: ["10-MIN INTERVAL · GROWTH", "1–60 MIN · ENTERPRISE", "CLIENT-SIDE REDACTION"],
        refusal: "Screenshots are never used for automated analysis, flagging, or alerting.",
      },
      {
        id: "dispute-and-review-workflow",
        name: "Dispute & Review Workflow",
        desc: "Employees can formally contest a score or classification with a date range, the disputed category, a reason, and supporting evidence. Disputes carry a five-business-day SLA with automatic escalation to HR on breach; an upheld dispute recalculates the affected date range and visibly corrects the historical record.",
        tier: "all",
        specs: ["5 BUSINESS-DAY SLA", "ESCALATES TO HR ON BREACH", "RECALCULATES ON UPHOLD"],
      },
      {
        id: "compliance-reports",
        name: "Compliance Reports",
        desc: "Automated reports covering data processing, consent and acknowledgment history, access logs, retention enforcement, dispute resolution, and the score calculation audit trail — exportable as PDF or CSV.",
        tier: "enterprise",
        specs: ["AUTOMATED", "PDF + CSV EXPORT", "SCORE AUDIT TRAIL INCLUDED"],
      },
      {
        id: "agent-deployment-options",
        name: "SSO & Agent Deployment",
        desc: "Self-installation on every plan guides employees through the required OS permissions. Enterprise adds SAML 2.0 single sign-on through Okta, Azure Active Directory, or Google Workspace, plus MDM deployment through Microsoft Intune, Jamf Pro, or similar tools using a pre-configured package with the organization's enrollment token.",
        tier: "enterprise",
        specs: ["SELF-INSTALL · ALL PLANS", "SSO / SAML 2.0 · ENTERPRISE", "MDM: INTUNE + JAMF PRO · ENTERPRISE"],
      },
    ],
  },
];

export type ExampleDay = {
  label: string;
  note: string;
  productive: number;
  passive: number;
  neutral: number;
  unproductive: number;
  idle: number;
  privateTime: number;
};

export const exampleDays: ExampleDay[] = [
  {
    label: "Deep work day",
    note: "Blocked focus, a training video, and a light administrative tail.",
    productive: 300,
    passive: 60,
    neutral: 45,
    unproductive: 15,
    idle: 40,
    privateTime: 20,
  },
  {
    label: "Meetings & reviews",
    note: "Back-to-back calls, review reads, and a short shopping detour.",
    productive: 180,
    passive: 150,
    neutral: 60,
    unproductive: 30,
    idle: 45,
    privateTime: 15,
  },
  {
    label: "Interrupted day",
    note: "Fragmented focus, constant context switches, and an errand break.",
    productive: 120,
    passive: 45,
    neutral: 90,
    unproductive: 120,
    idle: 75,
    privateTime: 30,
  },
  {
    label: "Steady hybrid",
    note: "Mixed focus with a protected private-time block at lunch.",
    productive: 240,
    passive: 90,
    neutral: 60,
    unproductive: 30,
    idle: 40,
    privateTime: 20,
  },
];

export type ScoreInput = Pick<ExampleDay, "productive" | "passive" | "neutral" | "unproductive">;

export type ScoreBreakdown = {
  numerator: number;
  denominator: number;
  score: number | null;
};

export function computeScore(input: ScoreInput): ScoreBreakdown {
  const numerator = input.productive + 0.5 * input.passive;
  const denominator = input.productive + input.neutral + input.unproductive + 0.5 * input.passive;
  const score = denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 100)) : null;
  return { numerator, denominator, score };
}
