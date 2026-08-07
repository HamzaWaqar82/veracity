import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { CaseStudiesHero } from "@/components/case-studies/CaseStudiesHero";
import { FieldReports } from "@/components/case-studies/FieldReports";
import { Outcomes } from "@/components/case-studies/Outcomes";
import { YourTeam } from "@/components/case-studies/YourTeam";
import { FinalCta } from "@/components/home/FinalCta";
import { fieldReports } from "@/components/case-studies/case-studies-data";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Anonymized field reports from real teams using Veracity: reduced status-check meetings, independently verified audit evidence, and operational wins - without a surveillance culture.",
  alternates: { canonical: "/case-studies" },
};

// schema.org has no CaseStudy type - per-report Article. Reports are
// anonymized, so authors and dates are deliberately omitted (no fabrication).
const schema = {
  "@context": "https://schema.org",
  "@graph": fieldReports.map((report) => ({
    "@type": "Article",
    headline: report.tagline,
    description: report.descriptor,
    url: `${SITE_URL}/case-studies#${report.id}`,
    mainEntityOfPage: `${SITE_URL}/case-studies`,
    inLanguage: "en",
    keywords: ["Veracity", "field report", report.industry],
  })),
};

export default function CaseStudiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CaseStudiesHero />
      <FieldReports />
      <Outcomes />
      <YourTeam />
      <FinalCta />
    </>
  );
}
