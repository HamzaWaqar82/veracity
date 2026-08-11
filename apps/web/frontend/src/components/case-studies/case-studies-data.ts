export type Stat = { value: string; label: string };

export type FieldReport = {
  id: string;
  descriptor: string;
  tagline: string;
  industry: string;
  size: string;
  plan: string;
  time: string;
  persona: string;
  challenge: string;
  challengeQuote?: string;
  solution: string;
  solutionQuote?: string;
  stats: Stat[];
  results: string[];
  quote: string;
};

export const fieldReports: FieldReport[] = [
  {
    id: "software-agency",
    descriptor: "Remote-first software agency",
    tagline: "Status-check meetings reduced by 60%",
    industry: "Software development and design consultancy",
    size: "45 employees · fully remote across 12 time zones",
    plan: "Growth · $12 per user per month",
    time: "14 months with Veracity",
    persona: "CEO",
    challenge:
      "Before Veracity, the leadership team relied on a combination of status-check meetings, gut feel, and self-reported progress to understand how work was progressing. As the team grew past 30 people, this approach broke down.",
    challengeQuote:
      "We had no visibility into whether people were actually working or just responding to messages all day. Burnout was invisible until someone was already checked out.",
    solution:
      "Deployed on the Growth plan with a company-wide rollout meeting explaining exactly what would be tracked and why. Every employee installed the Agent, linked their Google Calendar, and was given access to their personal dashboard. Two promises: everyone sees the same data, and Private Time is unlimited for the first month.",
    solutionQuote:
      "Private Time usage actually dropped to near zero after week two - once people saw the data was genuinely transparent, they stopped worrying about it.",
    stats: [
      { value: "60%", label: "reduction in status-check meetings" },
      { value: "78", label: "average productivity score, High Confidence on 85% of daily scores" },
      { value: "42 of 45", label: "employees rated the rollout positive or neutral" },
    ],
    results: [
      "Managers spent an average of 4 hours per week on status-check meetings before - now they use Veracity trend data in one-on-one coaching conversations instead.",
      "Three team members who regularly showed \"Uncertain - Mixed Context\" flags were discovered to be context-switching across too many projects, leading to a reallocation of work.",
      "The three employees who rated the rollout \"negative\" were given additional Private Time allowance and opted in after a trial period.",
    ],
    quote:
      "For agencies, your people are your product. If you treat them like assets to be monitored, you get asset-level output. The productivity data is a bonus - the real win is the trust it builds.",
  },
  {
    id: "consulting-firm",
    descriptor: "Professional services firm",
    tagline: "Client audit evidence accepted for 95% of the disputed period",
    industry: "Management consulting",
    size: "120 employees · hybrid, 60% in-office and 40% remote",
    plan: "Enterprise · $24 per user per month",
    time: "8 months with Veracity",
    persona: "Head of Compliance",
    challenge:
      "The compliance team needed to demonstrate that billable hours tracking aligned with actual work activity, but the existing time-tracking system relied entirely on self-reported entries. Sophisticated clients were challenging those entries and asking for independent verification.",
    challengeQuote:
      "The partners were resistant to anything that felt like surveillance. They wanted proof, not tools.",
    solution:
      "Deployed on the Enterprise plan with identifiable team benchmarking enabled with employee consent and configurable screenshot intervals set to 30 minutes. The rollout was phased: compliance and legal first, then a pilot group of 20 consultants, then the full team.",
    solutionQuote:
      "The jurisdiction-aware notice engine was a lifesaver - we operate in three different states and the EU, and having the right policy template automatically selected for each employee's jurisdiction saved us weeks of legal review.",
    stats: [
      { value: "95%", label: "of the disputed period correlated with billable entries during a client audit" },
      { value: "100%", label: "of employees with current, documented policy acknowledgment on file" },
      { value: "18%", label: "reduction in overtime after benchmarking identified one overloaded team" },
    ],
    results: [
      "3 disputes were filed in the first 2 months; all 3 were resolved within the 5-business-day SLA. 2 were upheld due to a categorization issue with custom internal tooling, and the scores were retroactively corrected.",
      "The consulting division reduced overtime by 18% after identifying that one team was consistently working at 140% of the company average.",
      "Team leads now use benchmarking data to identify overloaded teams before they burn out.",
    ],
    quote:
      "Veracity gave us the audit trail we needed without the surveillance culture we feared. The key was the phased rollout and the transparency features - our employees could see exactly what we could see.",
  },
  {
    id: "retail-operations",
    descriptor: "Operations-focused retail business",
    tagline: "28,000 USD saved annually through tool rationalization",
    industry: "Retail operations (multiple locations)",
    size: "180 employees · distributed across 5 locations plus a remote corporate team",
    plan: "Enterprise · $24 per user per month",
    time: "6 months with Veracity",
    persona: "Director of Operations",
    challenge:
      "The operations director needed visibility into how the corporate team's time was being spent across operational projects - which efforts were producing results and which were not.",
    challengeQuote:
      "We knew which stores were performing, but we had no idea whether the corporate support time was going to the highest-impact activities.",
    solution:
      "Deployed on the Enterprise plan with aggregate team benchmarking, covering only the corporate team of 45 users - not store-level staff, whose productivity is measured by sales rather than screen time.",
    solutionQuote:
      "This targeted approach made the rollout much simpler and avoided the surveillance concerns that a company-wide deployment would have raised.",
    stats: [
      { value: "35%", label: "of the supply chain team's time was in meetings rather than procurement tasks" },
      { value: "6-9 AM", label: "identified as the marketing team's peak productivity window" },
      { value: "28,000 USD", label: "saved annually after consolidating 47 SaaS tools down to 31" },
    ],
    results: [
      "Benchmarking revealed the supply chain team was spending 35% of their time in meetings rather than on procurement tasks, leading to a restructuring of meeting schedules.",
      "Marketing was most productive between 6 AM and 9 AM while most meetings were scheduled at 10 AM - meeting schedules were adjusted.",
      "Activity tracking revealed 47 overlapping SaaS applications; the organization consolidated to 31 tools, saving 28,000 USD annually in license costs.",
    ],
    quote:
      "Veracity is not a surveillance tool - it is an operations tool. We used the data to improve processes and remove friction, not to punish people.",
  },
];

export const digest = [
  { value: "60%", label: "fewer status-check meetings in software services" },
  { value: "95%", label: "of a disputed audit period independently verified" },
  { value: "100%", label: "policy acknowledgment coverage in professional services" },
  { value: "18%", label: "less overtime in the consulting division" },
];
