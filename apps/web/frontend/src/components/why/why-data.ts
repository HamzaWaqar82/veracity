export type Belief = { title: string; body: string };

export const falseChoiceBeliefs: Belief[] = [
  {
    title: "You can have visibility without surveillance.",
    body: "Collecting less data, collecting it transparently, and showing it to everyone creates better outcomes than collecting everything and hiding it.",
  },
  {
    title: "Trust is a competitive advantage.",
    body: "Teams that trust their employer to use monitoring data responsibly are more engaged and produce better work than teams that feel surveilled.",
  },
  {
    title: "Compliance is not optional.",
    body: "The regulatory landscape for employee monitoring is tightening globally. A tool built for compliance from day one is safer than one trying to retrofit controls.",
  },
];

export type LedgerRow = {
  dimension: string;
  traditional: string;
  veracity: string;
  voice: "affirms" | "refuses";
};

export const comparisonRows: LedgerRow[] = [
  {
    dimension: "Agent visibility",
    traditional: "Often hidden or minimal system tray presence",
    veracity: "Always visible, identifiable icon with capture status indicator",
    voice: "affirms",
  },
  {
    dimension: "Data collection scope",
    traditional: "Application usage, URLs, keystrokes, continuous video, email, file content",
    veracity: "Application usage, URLs (domain only by default), periodic screenshots (opt-in)",
    voice: "affirms",
  },
  {
    dimension: "Keystroke logging",
    traditional: "Common feature",
    veracity: "Never - architectural constraint at all tiers",
    voice: "refuses",
  },
  {
    dimension: "Stealth mode",
    traditional: "Often available",
    veracity: "Not available - design requirement",
    voice: "refuses",
  },
  {
    dimension: "Screenshot policy",
    traditional: "Captured continuously, often analyzed automatically",
    veracity: "Periodic (10-min default or configurable), redacted by default, manager-request viewing only",
    voice: "affirms",
  },
  {
    dimension: "Employee data access",
    traditional: "Limited or no employee view",
    veracity: "Full dashboard showing same data as manager; complete access log",
    voice: "affirms",
  },
  {
    dimension: "Private Time",
    traditional: "Limited or absent",
    veracity: "One-click pause of all capture, locally enforced limits, configurable daily allowance",
    voice: "affirms",
  },
  {
    dimension: "Sensitive-app exclusions",
    traditional: "Rarely offered - every app is captured",
    veracity: "Banking, password managers, and other private apps can be excluded from capture",
    voice: "affirms",
  },
  {
    dimension: "Productivity scoring",
    traditional: "Proprietary, undisclosed methodology",
    veracity: "Published formula visible to all employees; confidence indicators; no \u201caccuracy %\u201d claims",
    voice: "affirms",
  },
  {
    dimension: "Score usage",
    traditional: "Often feeds reviews, bonuses, and termination decisions",
    veracity: "Coaching and resource allocation only - not punishment",
    voice: "refuses",
  },
  {
    dimension: "Dispute workflow",
    traditional: "Limited or manual",
    veracity: "Formal dispute with 5-day SLA, automatic escalation, retroactive score correction",
    voice: "affirms",
  },
  {
    dimension: "Compliance",
    traditional: "Varies; often US-centric",
    veracity: "GDPR, EU AI Act, US state laws (CT, NY, DE, CO); jurisdiction-aware templates",
    voice: "affirms",
  },
  {
    dimension: "Audio/Video capture",
    traditional: "Common (always-on video, microphone)",
    veracity: "Never - architectural constraint",
    voice: "refuses",
  },
  {
    dimension: "On-premise deployment",
    traditional: "Sometimes available",
    veracity: "Cloud-native SaaS only (deliberate choice for security updates and compliance)",
    voice: "refuses",
  },
];

export type PersonaId = "everyone" | "employees" | "managers" | "admins";

export type PersonaPoint = { title: string; body: string };

export type Persona = {
  id: Exclude<PersonaId, "everyone">;
  label: string;
  intro: string;
  points: PersonaPoint[];
  quote?: { text: string; attribution: string };
};

export const personas: Persona[] = [
  {
    id: "employees",
    label: "Employees",
    intro: "With Veracity, employees get the same dashboard their manager sees - with the same data, updated in real time.",
    points: [
      {
        title: "Full transparency",
        body: "The same dashboard their manager sees, with the same data, updated in real time.",
      },
      {
        title: "Privacy controls",
        body: "Private Time pauses all capture with one click. The sensitive-app exclusion list prevents capture during banking, password management, and other private activities.",
      },
      {
        title: "Data ownership",
        body: "Every employee can export their complete data at any time through the DSAR workflow.",
      },
      {
        title: "Fair scoring",
        body: "The productivity formula is published and visible. Disputes are handled through a formal workflow with a tracked SLA.",
      },
      {
        title: "No surprises",
        body: "Every screenshot capture is known to the employee. Every access to their data is logged in the access log.",
      },
    ],
    quote: {
      text: "The fact that our employees can see everything we see made adoption smooth and trust high.",
      attribution: "Operations lead, remote software team · early design partner",
    },
  },
  {
    id: "managers",
    label: "Managers",
    intro: "With Veracity, managers get granular insight without drowning in meaningless data - and context, not punishment.",
    points: [
      {
        title: "Actionable data",
        body: "Activity tracking at sixty-second heartbeat intervals provides granular insight into application usage, time allocation, and productivity trends - without drowning managers in meaningless data.",
      },
      {
        title: "Context, not punishment",
        body: "Meeting-aware idle detection and confidence indicators ensure that scores reflect actual work patterns, not simplistic time tracking.",
      },
      {
        title: "Fair benchmarking",
        body: "Team benchmarking with aggregate defaults ensures that productivity comparisons are useful without being invasive.",
      },
      {
        title: "Compliance confidence",
        body: "Automated audit trails, jurisdiction-aware policy templates, and DSAR workflows ensure that monitoring data can withstand regulatory scrutiny.",
      },
    ],
    quote: {
      text: "Veracity gave us the audit trail we needed without the surveillance culture we feared.",
      attribution: "Head of compliance, professional services firm · early design partner",
    },
  },
  {
    id: "admins",
    label: "Administrators",
    intro: "With Veracity, administrators get guided setup, drift alerting, and every control - with no infrastructure to manage.",
    points: [
      {
        title: "Guided setup",
        body: "A five-step wizard that takes under 30 minutes for a non-technical admin to configure the entire organization.",
      },
      {
        title: "Drift alerting",
        body: "The server monitors every Agent's reported state against configured policy and raises alerts when drift is detected.",
      },
      {
        title: "Configurable everything",
        body: "From monitoring policy templates to sensitive-app exclusion lists to data retention periods (Enterprise), every control is accessible through the admin dashboard.",
      },
      {
        title: "No infrastructure management",
        body: "Veracity is cloud-native SaaS - no servers to provision, no databases to maintain, no updates to deploy.",
      },
    ],
  },
];

export type RoiSection = { id: string; title: string; lead: string; pull: string };

export type FieldEvidence = { value: string; label: string };

export const fieldEvidence: FieldEvidence[] = [
  { value: "60%", label: "fewer status-check meetings" },
  { value: "18%", label: "less overtime" },
  { value: "28,000 USD", label: "saved annually" },
];

export const roiSections: RoiSection[] = [
  {
    id: "reduced-turnover",
    title: "Reduced Turnover",
    lead: "The strongest predictor of employee resistance to monitoring is lack of transparency.",
    pull: "A tool that hides itself, collects data without employee knowledge, and withholds their own data creates resentment - and drives away the high-performing knowledge workers an SMB can least afford to lose.",
  },
  {
    id: "better-data-quality",
    title: "Better Data Quality",
    lead: "When employees understand and trust the monitoring system, they cooperate with it.",
    pull: "They classify their own time accurately and use Private Time appropriately - so data reflects actual work patterns, not resistance behaviors like app-switching and idle avoidance.",
  },
  {
    id: "compliance-cost-reduction",
    title: "Compliance Cost Reduction",
    lead: "The regulatory cost of non-compliance with employee monitoring laws can be substantial.",
    pull: "Jurisdiction-aware controls, an audit trail, and policy acknowledgment workflows automate the compliance documentation that organizations would otherwise manage manually or through expensive legal review.",
  },
];

export const fitFor = [
  "Small-to-medium businesses (10\u2013200 employees) that need productivity visibility",
  "Remote-first and hybrid teams",
  "Organizations that prioritize employee trust and transparency",
  "Companies subject to GDPR, EU AI Act, or US state electronic monitoring laws",
  "Teams where monitoring data is used for coaching and resource allocation, not punishment",
];

export const notFitFor = [
  "Large enterprises (200+ employees) - the platform is optimized for SMB scale",
  "Organizations requiring DLP (data loss prevention) enforcement - Veracity logs USB and file events only, with no allow/deny capability",
  "Organizations requiring on-premise deployment - Veracity is cloud-native SaaS only",
  "Organizations that want covert or stealth monitoring - Veracity is designed to be transparent",
  "Organizations that need keystroke logging or continuous video recording - Veracity never collects these",
];

export type CustomerQuote = { text: string; attribution: string; role: string };

export const customerQuotes: CustomerQuote[] = [
  {
    text: "We needed visibility into our remote team's workflow without making people feel like they were being spied on. Veracity gave us exactly that - actionable productivity data with zero creep factor.",
    attribution: "Operations lead",
    role: "remote software team · early design partner",
  },
  {
    text: "Veracity is the first platform I have seen that genuinely prioritizes privacy. The audit trail, consent management, and data retention controls give me everything I need for GDPR compliance without the usual surveillance baggage.",
    attribution: "Head of Compliance",
    role: "professional services firm · early design partner",
  },
  {
    text: "Veracity is not a surveillance tool - it is an operations tool. We used the data to improve processes and remove friction, not to punish people.",
    attribution: "Director of Operations",
    role: "retail operations team · early design partner",
  },
];
