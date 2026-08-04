export type TierCellValue = "yes" | "no" | "not-available" | string;
export type TierCells = [TierCellValue, TierCellValue, TierCellValue];

export type FeatureRow = { feature: string; cells: TierCells };

export type FeatureGroup = {
  id: string;
  name: string;
  rows: FeatureRow[];
};

export type Tier = {
  id: string;
  name: string;
  monthly: string;
  annual: string;
  year: string;
  pitch: string;
  users: string;
  support: string;
  supportShort: string;
  highlight: string;
};

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: "$6",
    annual: "$5",
    year: "$60",
    pitch:
      "Essential productivity tracking for small teams of up to 10 users — the complete trust stack from day one.",
    users: "Up to 10 users",
    support: "Email · response within 1 business day",
    supportShort: "Email support",
    highlight:
      "Published scoring, Private Time, and the AES-256 offline cache are included at every tier.",
  },
  {
    id: "growth",
    name: "Growth",
    monthly: "$12",
    annual: "$10",
    year: "$120",
    pitch:
      "For growing teams of up to 50 users that need deeper visibility — redacted screenshots, benchmarking, and API access.",
    users: "Up to 50 users",
    support: "In-app chat · response within 4 hours",
    supportShort: "In-app chat",
    highlight:
      "10-minute screenshot monitoring with client-side redaction, aggregate benchmarking, and the REST API.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: "$24",
    annual: "$20",
    year: "$240",
    pitch:
      "Unlimited users and full control — SSO, configurable monitoring, compliance exports, and a dedicated account manager.",
    users: "Unlimited users",
    support: "Dedicated + 24/7 for critical issues",
    supportShort: "Dedicated + 24/7",
    highlight:
      "Configurable 1–60 min screenshots, SSO / SAML 2.0, compliance reports, and MDM deployment.",
  },
];

export const featureGroups: FeatureGroup[] = [
  {
    id: "pricing-billing",
    name: "Pricing & billing",
    rows: [
      { feature: "Monthly price per user", cells: ["$6", "$12", "$24"] },
      { feature: "Annual price per user per year", cells: ["$60", "$120", "$240"] },
    ],
  },
  {
    id: "track",
    name: "Track",
    rows: [
      { feature: "Activity tracking (60s heartbeat)", cells: ["yes", "yes", "yes"] },
      { feature: "App and URL categorization (customizable)", cells: ["yes", "yes", "yes"] },
      {
        feature: "Meeting-aware idle detection (Google Calendar, Outlook)",
        cells: ["yes", "yes", "yes"],
      },
      { feature: "Private Time mode", cells: ["yes", "yes", "yes"] },
      { feature: "Offline encrypted cache (AES-256, 7-day TTL, 50 MB)", cells: ["yes", "yes", "yes"] },
      { feature: "USB device detection (logging only)", cells: ["yes", "yes", "yes"] },
      { feature: "File operation tracking (path only)", cells: ["yes", "yes", "yes"] },
    ],
  },
  {
    id: "visual-monitoring",
    name: "Visual monitoring",
    rows: [
      {
        feature: "Screenshot monitoring",
        cells: ["no", "10-minute interval", "Configurable 1–60 min"],
      },
      { feature: "Client-side redaction (OCR, default)", cells: ["no", "yes", "yes"] },
      { feature: "Sensitive-app exclusion list (configurable)", cells: ["no", "yes", "yes"] },
      { feature: "Manager-request screenshot viewing (logged)", cells: ["no", "yes", "yes"] },
    ],
  },
  {
    id: "understand",
    name: "Understand",
    rows: [
      {
        feature: "Daily productivity score (0–100, published methodology)",
        cells: ["yes", "yes", "yes"],
      },
      { feature: "Confidence indicators (High/Uncertain)", cells: ["yes", "yes", "yes"] },
      { feature: "Employee dashboard (real-time via SSE)", cells: ["yes", "yes", "yes"] },
      { feature: "Team benchmarking (aggregate)", cells: ["no", "yes", "yes"] },
      { feature: "Team benchmarking (identifiable, with consent)", cells: ["no", "no", "yes"] },
    ],
  },
  {
    id: "control",
    name: "Control",
    rows: [
      { feature: "Dispute and review workflow (5 business day SLA)", cells: ["yes", "yes", "yes"] },
      { feature: "Guided setup wizard (< 30 minutes)", cells: ["yes", "yes", "yes"] },
      { feature: "Policy acknowledgment and consent management", cells: ["yes", "yes", "yes"] },
      { feature: "REST API (1,000 requests per hour)", cells: ["no", "1,000 req/hour", "no"] },
      { feature: "REST API (10,000 requests per hour)", cells: ["no", "no", "10,000 req/hour"] },
      {
        feature: "SSO / SAML 2.0 (Okta, Azure AD, Google Workspace)",
        cells: ["no", "no", "yes"],
      },
      { feature: "Bulk user provisioning (CSV upload, 500 rows)", cells: ["no", "Optional", "yes"] },
      { feature: "Custom data retention (per data type, automated deletion)", cells: ["no", "no", "yes"] },
      { feature: "MDM agent deployment (Intune, Jamf Pro)", cells: ["no", "no", "yes"] },
    ],
  },
  {
    id: "compliance-audit",
    name: "Compliance & audit",
    rows: [
      { feature: "Data Subject Access Request (DSAR) workflows", cells: ["yes", "yes", "yes"] },
      { feature: "Jurisdiction-aware notice engine", cells: ["yes", "yes", "yes"] },
      { feature: "Tamper-evident audit logging", cells: ["yes", "yes", "yes"] },
      { feature: "Compliance reports (PDF and CSV export)", cells: ["no", "no", "yes"] },
    ],
  },
  {
    id: "support-limits",
    name: "Support & limits",
    rows: [
      { feature: "User limit", cells: ["10", "50", "Unlimited"] },
      { feature: "Support channel", cells: ["Email", "In-app chat", "Dedicated + 24/7"] },
      {
        feature: "Support response time target",
        cells: [
          "Within 1 business day",
          "Within 4 hours (business hours)",
          "Within 1 hour (business), 24/7 for critical",
        ],
      },
      {
        feature: "Support hours",
        cells: ["Business hours", "Business hours", "Business hours + 24/7 critical"],
      },
      {
        feature: "Additional user seats beyond plan limit",
        cells: ["not-available", "not-available", "Not applicable (unlimited)"],
      },
      { feature: "Dedicated account manager", cells: ["no", "no", "yes"] },
    ],
  },
];

export type BillingEntry = {
  title: string;
  body: string;
  flags?: string[];
};

export const billingEntries: BillingEntry[] = [
  {
    title: "How billing is calculated",
    body: "Per active user per month. An active user is any employee with the Agent installed who sent at least one heartbeat in the billing period; employees with no heartbeat for 30 consecutive days are not billed. Billing is calculated at the end of each period on the average active-user count.",
    flags: ["No seat minimum and no setup fee — start with a single user."],
  },
  {
    title: "Annual billing discount",
    body: "Two months free per year: you pay for ten months and receive two months free. Annual Starter is $60, Growth $120, and Enterprise $240 per user per year — equivalent to $5, $10, and $20 per user per month. Annual plans are billed once per year.",
    flags: ["No partial refunds are given for mid-cycle downgrades under annual billing."],
  },
  {
    title: "Free trial",
    body: "14 days, with full access to every feature of the chosen plan. No credit card is required, and data collected during the trial is preserved if you convert to a paid plan.",
  },
  {
    title: "Switching plans",
    body: "Upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle, charges are prorated for the remainder of the current cycle, and feature access stays at your existing plan level until the change takes effect.",
  },
  {
    title: "Exceeding your user limit",
    body: "At 90% of your plan's limit, all organization administrators receive a notification. Past the limit, new Agent installations are blocked — existing Agents continue to function — until you upgrade to the next tier.",
    flags: ["Additional seats beyond a plan's limit are not available — you must move up a tier."],
  },
  {
    title: "Non-profit & education discounts",
    body: "A 20% discount for verified non-profit organizations and accredited educational institutions, applied to monthly and annual billing across all plans. Email sales@veracity.dev with your verification documents.",
  },
  {
    title: "Payment methods",
    body: "Visa, Mastercard, American Express, and Discover are accepted. Enterprise plans may be eligible for invoicing with net-30 terms on annual contracts.",
  },
  {
    title: "Cancellation & data retention",
    body: "When an organization cancels its subscription, all collected data is retained for 30 days as a reactivation grace period, then permanently deleted.",
    flags: ["Retention during the active subscription period is configurable on Enterprise plans."],
  },
];

export const neverOffers: { title: string; body: string }[] = [
  {
    title: "Keystroke logging",
    body: "Never logs keystrokes, key counts, or any form of keyboard input content — at any tier, now or in any future version.",
  },
  {
    title: "Continuous video or screen recording",
    body: "Periodic screenshots only, never continuous recording.",
  },
  {
    title: "Stealth or covert monitoring",
    body: "The Agent is always visible and identifiable in the system tray. There is no stealth mode.",
  },
  {
    title: "Audio or webcam capture",
    body: "No microphone or webcam data collection.",
  },
  {
    title: "Emotion recognition or biometric inference",
    body: "Prohibited by the EU AI Act and by product positioning.",
  },
  {
    title: "On-premise deployment",
    body: "Cloud-native SaaS only.",
  },
  {
    title: "DLP policy enforcement",
    body: "USB and file events are logging-only — no allow/deny enforcement.",
  },
];

export const deferredOffers: { title: string; body: string }[] = [
  {
    title: "HRIS or SCIM integration",
    body: "Deferred post-MVP — on the roadmap, not part of the signed refusal list above.",
  },
];

export const billingFaqs: { q: string; a: string }[] = [
  {
    q: "What are the Veracity pricing plans?",
    a: "Starter is $6 per user per month, Growth $12, and Enterprise $24, with no seat minimum and no setup fee. Annual billing gives two months free: $60, $120, and $240 per user per year. Every plan includes a 14-day free trial, with no credit card required.",
  },
  {
    q: "How is billing calculated per user?",
    a: "Billing is calculated per active user per month. An active user is any employee who has the Agent installed and sent at least one heartbeat in the billing period; employees with no heartbeat for 30 consecutive days are not billed. Billing is calculated at the end of each period on the average active-user count, with no setup fees or hidden charges.",
  },
  {
    q: "Is there an annual billing discount?",
    a: "Yes — two months free per year. You pay for ten months and receive two months free: annual Starter is $60 per user per year ($5/mo), Growth $120 ($10/mo), and Enterprise $240 ($20/mo). Annual plans are billed once per year, with no partial refunds for mid-cycle downgrades.",
  },
  {
    q: "Can I switch plans mid-cycle?",
    a: "Yes. You can upgrade or downgrade at any time. Changes take effect at the start of the next billing cycle, charges are prorated for the remainder of the current cycle, and feature access stays at your existing plan level until the change takes effect.",
  },
  {
    q: "What happens if I exceed my user limit?",
    a: "At 90% of your plan's limit, all administrators are notified. Past the limit, new Agent installations are blocked and existing Agents continue to function until you upgrade. Additional seats beyond a plan's limit are not available — you must move to a higher tier.",
  },
  {
    q: "Do you offer discounts for non-profits or educational institutions?",
    a: "Yes — a 20% discount for verified non-profit organizations and accredited educational institutions, applied to monthly and annual billing on all plans. Email sales@veracity.dev with your verification documents.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa, Mastercard, American Express, and Discover. Enterprise plans may be eligible for invoicing with net-30 terms on annual contracts. For invoicing inquiries, contact sales@veracity.dev.",
  },
];
