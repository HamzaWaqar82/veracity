import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type NavLink = { label: string; href: string };

export type MegaColumn = { heading?: string; links: NavLink[] };

export type MegaPanel = {
  columns: MegaColumn[];
  cta?: { label: string; href: string };
};

export type NavItem = {
  label: string;
  href: string;
  mega?: MegaPanel;
};

const contentRoot = path.join(process.cwd(), "..", "content", "pages");

const BLOG_FILES = [
  "how-productivity-scoring-works",
  "transparent-monitoring-for-modern-teams",
  "smb-guide-to-workforce-analytics",
];

function readFrontmatterTitle(file: string): string {
  try {
    const raw = fs.readFileSync(path.join(contentRoot, "blog", `${file}.md`), "utf8");
    return String(matter(raw).data.title ?? file);
  } catch {
    return file;
  }
}

export const essays = BLOG_FILES.map((file) => ({
  label: readFrontmatterTitle(file),
  href: `/blog/${file}`,
}));

export const nav = {
  main: [
    {
      label: "Features",
      href: "/features",
      mega: {
        columns: [
          {
            heading: "Track",
            links: [
              { label: "Activity Tracking", href: "/features#activity-tracking" },
              { label: "App Categorization Engine", href: "/features#app-categorization-engine" },
              { label: "Meeting-Aware Idle Detection", href: "/features#meeting-aware-idle-detection" },
              { label: "Private Time Mode", href: "/features#private-time-mode" },
            ],
          },
          {
            heading: "Understand",
            links: [
              { label: "Productivity Scoring", href: "/features#productivity-scoring" },
              { label: "Employee Dashboard", href: "/features#employee-dashboard" },
              { label: "Team Benchmarking", href: "/features#team-benchmarking" },
              { label: "Guided Setup Wizard", href: "/features#guided-setup-wizard" },
            ],
          },
          {
            heading: "Control",
            links: [
              { label: "Screenshot Monitoring", href: "/features#screenshot-monitoring" },
              { label: "Dispute & Review Workflow", href: "/features#dispute-and-review-workflow" },
              { label: "Compliance Reports", href: "/features#compliance-reports" },
              { label: "SSO & MDM Deployment", href: "/features#agent-deployment-options" },
            ],
          },
        ],
        cta: { label: "Compare plans", href: "/pricing" },
      },
    },
    {
      label: "Pricing",
      href: "/pricing",
      mega: {
        columns: [
          {
            links: [
              { label: "Starter · $6 per user / month", href: "/pricing#starter" },
              { label: "Growth · $12 per user / month", href: "/pricing#growth" },
              { label: "Enterprise · $24 per user / month", href: "/pricing#enterprise" },
            ],
          },
        ],
        cta: { label: "Get Early Access", href: "/early-access" },
      },
    },
    {
      label: "Why Veracity",
      href: "/why-veracity",
      mega: {
        columns: [
          {
            heading: "The Difference",
            links: [
              { label: "The False Choice: Visibility or Trust", href: "/why-veracity#the-false-choice-visibility-or-trust" },
              { label: "Comparison with Traditional Tools", href: "/why-veracity#comparison-with-traditional-monitoring-tools" },
              { label: "The ROI of Transparent Monitoring", href: "/why-veracity#the-roi-of-transparent-monitoring" },
              { label: "When Veracity Isn't the Right Fit", href: "/why-veracity#when-veracity-is-not-the-right-fit" },
            ],
          },
          {
            heading: "Trust & Compliance",
            links: [
              { label: "Compliance & Trust Center", href: "/compliance" },
              { label: "What We Collect and Never Collect", href: "/compliance#data-collection-what-we-collect-and-what-we-do-not" },
              { label: "Security Architecture", href: "/compliance#security-architecture" },
              { label: "Retention & Portability", href: "/compliance#data-processing-and-retention" },
            ],
          },
          {
            heading: "Proof & Resources",
            links: [
              { label: "Case Studies", href: "/case-studies" },
              { label: "What Customers Say", href: "/why-veracity#what-customers-say" },
              { label: "The Fair Monitoring Manifesto", href: "/about" },
            ],
          },
        ],
        cta: { label: "Read the Manifesto", href: "/about" },
      },
    },
    {
      label: "Blog",
      href: "/blog",
      mega: {
        columns: [
          { links: essays },
        ],
        cta: { label: "All articles", href: "/blog" },
      },
    },
  ] as NavItem[],
};

export const footer = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Compliance", href: "/compliance" },
    { label: "Case Studies", href: "/case-studies" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Why Veracity", href: "/why-veracity" },
    { label: "Blog", href: "/blog" },
  ],
} satisfies Record<string, { label: string; href: string }[]>;

export const contentPageSlugs = [
  "features",
  "pricing",
  "why-veracity",
  "blog",
  "integrations",
  "compliance",
  "case-studies",
  "about",
];

export function readContentTitle(pageSlug: string): string | null {
  const file = pageSlug.startsWith("blog/")
    ? path.join(contentRoot, "blog", `${pageSlug.slice("blog/".length)}.md`)
    : path.join(contentRoot, `${pageSlug}.md`);
  try {
    return String(matter(fs.readFileSync(file, "utf8")).data.title ?? "");
  } catch {
    return null;
  }
}
