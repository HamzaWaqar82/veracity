import type { Metadata } from "next";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { Methodology } from "@/components/features/Methodology";
import { CapabilitySection } from "@/components/features/CapabilitySection";
import { FinalCta } from "@/components/home/FinalCta";
import { capabilities } from "@/components/features/features-data";

export const metadata: Metadata = {
  title: "Features — Down to the Exact Interval",
  description:
    "The complete Veracity feature specification: activity tracking, published productivity scoring, employee dashboards, optional screenshot monitoring, compliance reports, and deployment — with the exact numbers, by plan tier.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <FeaturesHero />
      <Methodology />
      {capabilities.map((capability) => (
        <CapabilitySection key={capability.id} capability={capability} />
      ))}
      <FinalCta />
    </>
  );
}
