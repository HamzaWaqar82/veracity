import type { Metadata } from "next";
import { CaseStudiesHero } from "@/components/case-studies/CaseStudiesHero";
import { FieldReports } from "@/components/case-studies/FieldReports";
import { Outcomes } from "@/components/case-studies/Outcomes";
import { YourTeam } from "@/components/case-studies/YourTeam";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Anonymized field reports from real teams using Veracity: reduced status-check meetings, independently verified audit evidence, and operational wins — without a surveillance culture.",
  alternates: { canonical: "/case-studies" },
};

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <FieldReports />
      <Outcomes />
      <YourTeam />
      <FinalCta />
    </>
  );
}
