import type { Metadata } from "next";
import { TrialHero } from "@/components/trial/TrialHero";
import { TrialIncludesCard } from "@/components/trial/TrialIncludesCard";
import { TrialForm } from "@/components/trial/TrialForm";
import { ContactLedger } from "@/components/contact/ContactLedger";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Start Free Trial",
  description:
    "Start a 14-day free trial of Veracity with full access to every feature of your plan. No credit card, no seat minimum. Agent for Windows, macOS, and Linux.",
  alternates: { canonical: "/trial" },
};

export default function TrialPage() {
  return (
    <>
      <TrialHero />
      <section className="border-t border-line bg-white py-section" aria-labelledby="trial-ledger-heading">
        <div className="container-x">
          <h2 id="trial-ledger-heading" className="sr-only">
            Trial details and request form
          </h2>
          <ContactLedger>
            <div className="js-ledger-col">
              <TrialIncludesCard />
            </div>
            <div className="js-ledger-col">
              <TrialForm />
            </div>
          </ContactLedger>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
