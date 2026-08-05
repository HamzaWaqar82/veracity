import type { Metadata } from "next";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoScopeCard } from "@/components/demo/DemoScopeCard";
import { DemoRequestForm } from "@/components/demo/DemoRequestForm";
import { ContactLedger } from "@/components/contact/ContactLedger";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Request a Demo",
  description:
    "Book a live 30-minute demonstration of Veracity: the Agent, manager dashboard, and employee self-service portal, shown against your team's workflows. Available Monday through Friday, 9 AM to 6 PM UTC.",
  alternates: { canonical: "/request-demo" },
};

export default function RequestDemoPage() {
  return (
    <>
      <DemoHero />
      <section className="border-t border-line bg-white py-section" aria-labelledby="demo-ledger-heading">
        <div className="container-x">
          <h2 id="demo-ledger-heading" className="sr-only">
            Demo details and request form
          </h2>
          <ContactLedger>
            <div className="js-ledger-col">
              <DemoScopeCard />
            </div>
            <div className="js-ledger-col">
              <DemoRequestForm />
            </div>
          </ContactLedger>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
