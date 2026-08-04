import type { Metadata } from "next";
import { ComplianceHero } from "@/components/compliance/ComplianceHero";
import { CollectLedger } from "@/components/compliance/CollectLedger";
import { Frameworks } from "@/components/compliance/Frameworks";
import { SecuritySection } from "@/components/compliance/SecuritySection";
import { RetentionSection } from "@/components/compliance/RetentionSection";
import { DisclosureSection } from "@/components/compliance/DisclosureSection";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Compliance and Trust — Veracity",
  description:
    "The Veracity Compliance and Trust Center: what we collect and never collect, GDPR and EU AI Act controls, US state monitoring statutes, security architecture, retention, and disclosure.",
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return (
    <>
      <ComplianceHero />
      <CollectLedger />
      <Frameworks />
      <SecuritySection />
      <RetentionSection />
      <DisclosureSection />
      <FinalCta />
    </>
  );
}
