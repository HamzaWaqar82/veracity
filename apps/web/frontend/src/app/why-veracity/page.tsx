import type { Metadata } from "next";
import { WhyHero } from "@/components/why/WhyHero";
import { FalseChoice } from "@/components/why/FalseChoice";
import { ComparisonLedger } from "@/components/why/ComparisonLedger";
import { Difference } from "@/components/why/Difference";
import { Roi } from "@/components/why/Roi";
import { NotRightFit } from "@/components/why/NotRightFit";
import { CustomersSay } from "@/components/why/CustomersSay";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Why Veracity — The Transparent Alternative to Employee Surveillance",
  description:
    "Why Veracity rejects the false choice between visibility and trust: a side-by-side comparison with traditional monitoring tools, the ROI of transparent monitoring, and when Veracity is not the right fit.",
  alternates: { canonical: "/why-veracity" },
};

export default function WhyVeracityPage() {
  return (
    <>
      <WhyHero />
      <FalseChoice />
      <ComparisonLedger />
      <Difference />
      <Roi />
      <NotRightFit />
      <CustomersSay />
      <FinalCta />
    </>
  );
}
