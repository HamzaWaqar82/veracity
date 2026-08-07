export type Principle = { n: string; title: string; body: string };

export const manifesto: Principle[] = [
  {
    n: "01",
    title: "Transparency by default",
    body: "Every employee sees the same data their manager sees. The Agent is always identifiable in the system tray with a visible capture indicator. There is no stealth mode, no hidden capture, and the employee dashboard includes a complete access log showing who has viewed their data and when.",
  },
  {
    n: "02",
    title: "Privacy as a feature",
    body: "We collect only what is necessary for productivity analytics - application usage, window titles, and periodic screenshots on plans that include it. We do not log keystrokes, record continuously, or capture audio or video. Screenshots are encrypted at the point of capture and redacted by default.",
  },
  {
    n: "03",
    title: "Data minimization",
    body: "Activity tracking runs on a sixty-second heartbeat cycle, not a continuous stream. We capture state, not recordings. Retention is configurable with automated deletion, and Private Time pauses all capture at any time - only the duration is recorded, and the Agent enforces it locally so suppression works even when the server is unreachable.",
  },
  {
    n: "04",
    title: "Human-in-the-loop accountability",
    body: "No automated decisions affect employment outcomes. Productivity scores are advisory tools for coaching conversations, not performance evaluations. Screenshots require an explicit manager request to view (no automatic flagging or alerts based on screen content), and every access is logged in a tamper-evident audit trail.",
  },
  {
    n: "05",
    title: "Compliance-first architecture",
    body: "Every feature is designed with regulatory compliance as a primary requirement. We comply with the GDPR, the EU AI Act, and US state electronic monitoring statutes in Connecticut, New York, Delaware, and Colorado. A jurisdiction-aware notice engine applies the right policy template for every organization based on its registered jurisdiction.",
  },
];

export const story: string[] = [
  "Veracity started as an internal tool at a remote-first software consultancy. We needed to understand how our distributed teams were spending their time, but every monitoring product we tried either collected too much data, operated without transparency, or made our employees feel distrusted. So we built our own.",
  "The principle was simple: collect the minimum data needed to answer real business questions, show every employee exactly what was collected, and never operate in secret. When we shared our approach at a conference, dozens of other SMB leaders asked if they could use it too. Veracity was born.",
  "Since then, Veracity has grown into a full workforce-analytics platform purpose-built for small-to-medium businesses with 10 to 200 employees. We serve remote-first companies, hybrid teams, and traditional offices across professional services, technology, retail operations, and non-profit sectors.",
];

export const sectors = [
  "Professional services",
  "Technology",
  "Retail operations",
  "Non-profit",
];

export type TeamMember = { name: string; role: string; bio: string };

export const team: TeamMember[] = [
  {
    name: "Alex Rivera",
    role: "CEO and Co-Founder",
    bio: "Alex spent a decade building remote teams at SaaS companies. He saw firsthand how badly designed monitoring tools destroyed trust and how thoughtfully designed ones improved productivity without hurting culture. Alex leads product vision and customer relationships.",
  },
  {
    name: "Dr. Priya Mehta",
    role: "CTO and Co-Founder",
    bio: "Priya is a security engineer who previously led compliance infrastructure at a fintech company. She designed Veracity's encryption architecture, data retention systems, and the Agent's cross-platform capture engine. Priya oversees all engineering and security operations.",
  },
  {
    name: "Jordan Taylor",
    role: "Head of Trust and Compliance",
    bio: "Jordan is a privacy lawyer turned product manager who ensures Veracity stays ahead of regulatory requirements across every jurisdiction we operate in. Jordan oversees the compliance roadmap, audits, and data protection impact assessments.",
  },
  {
    name: "Emily Nakamura",
    role: "Head of Customer Success",
    bio: "Emily leads onboarding, training, and support. She designed the guided setup wizard and the customer success program for Enterprise accounts.",
  },
];

export type SupportRow = {
  channel: string;
  availability: string;
  response: string;
};

export const supportRows: SupportRow[] = [
  { channel: "Email (all plans)", availability: "Business hours", response: "Within one business day" },
  { channel: "In-app chat (Growth and Enterprise)", availability: "Business hours", response: "Within four hours" },
  { channel: "Dedicated support (Enterprise)", availability: "Business hours", response: "Within one hour" },
  { channel: "Critical issues (Enterprise)", availability: "24/7", response: "Within one hour" },
];

export const emails = [
  { label: "General support", email: "support@veracity.dev" },
  { label: "Sales inquiries", email: "sales@veracity.dev" },
  { label: "Privacy and compliance", email: "privacy@veracity.dev" },
  { label: "Billing inquiries", email: "billing@veracity.dev" },
];

export const demoItems = [
  "The Agent installation process on Windows, macOS, and Linux",
  "Configuration through the guided setup wizard",
  "The manager dashboard with productivity trends and benchmarking",
  "The employee self-service portal with activity log and Private Time controls",
  "Compliance and governance controls including audit logs, data retention, and DSAR workflows",
];

export const availability =
  "Available Monday through Friday, 9 AM to 6 PM UTC.";

export const office =
  "Veracity is based in Wilmington, Delaware, USA. We operate as a fully remote team across North America and Europe.";
