import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PlanSummary } from "@/components/pricing/PlanSummary";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { BillingDetails } from "@/components/pricing/BillingDetails";
import { NeverOffers } from "@/components/pricing/NeverOffers";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { FinalCta } from "@/components/home/FinalCta";
import { tiers } from "@/components/pricing/pricing-data";

export const metadata: Metadata = {
  title: "Pricing | Published Terms, No Hidden Fees",
  description:
    "Veracity pricing, stated in exact numbers: Starter $6, Growth $12, Enterprise $24 per user per month. Two months free on annual billing, a 14-day no-credit-card trial, and the full feature matrix published by plan.",
  alternates: { canonical: "/pricing" },
};

// Derived from the `tiers` constants - never a parallel price list. The
// `schema-prices` + `prices` check-facts rules gate the values against the corpus.
const schema = {
  "@context": "https://schema.org",
  "@graph": tiers.flatMap((tier) => {
    const url = `${SITE_URL}/pricing#${tier.id}`;
    const modes = [
      { key: "monthly", price: tier.monthly.slice(1), unitText: "per user per month, billed monthly" },
      { key: "annual", price: tier.annual.slice(1), unitText: "per user per month, billed annually" },
      { key: "annual-year", price: tier.year.slice(1), unitText: "per user per year" },
    ];
    return modes.map((mode) => ({
      "@type": "Offer",
      "@id": `${url}#${mode.key}`,
      name: `${tier.name} · ${mode.unitText}`,
      url,
      description: tier.pitch,
      priceCurrency: "USD",
      price: mode.price,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: mode.price,
        priceCurrency: "USD",
        unitText: mode.unitText,
      },
    }));
  }),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
