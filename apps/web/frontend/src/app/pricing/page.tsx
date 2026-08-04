import type { Metadata } from "next";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PlanSummary } from "@/components/pricing/PlanSummary";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { BillingDetails } from "@/components/pricing/BillingDetails";
import { NeverOffers } from "@/components/pricing/NeverOffers";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Pricing — Published Terms, No Hidden Fees",
  description:
    "Veracity pricing, stated in exact numbers: Starter $6, Growth $12, Enterprise $24 per user per month. Two months free on annual billing, a 14-day no-credit-card trial, and the full feature matrix published by plan.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PlanSummary />
      <ComparisonTable />
      <BillingDetails />
      <NeverOffers />
      <PricingFaq />
      <FinalCta />
    </>
  );
}
