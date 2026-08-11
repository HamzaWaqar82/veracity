import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactLedger } from "@/components/contact/ContactLedger";
import { DemoCard } from "@/components/contact/DemoCard";
import { SupportChannelsCard } from "@/components/contact/SupportChannelsCard";
import { ContactForm } from "@/components/contact/ContactForm";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact the Veracity team: request a live demo, ask about pricing, or reach our support, sales, privacy, and billing teams. Available Monday through Friday, 9 AM to 6 PM UTC.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <>
      <ContactHero />
      <section className="border-t border-line bg-white py-section" aria-labelledby="contact-ledger-heading">
        <div className="container-x">
          <h2 id="contact-ledger-heading" className="sr-only">
            Contact channels and inquiry form
          </h2>
          <ContactLedger>
            <div className="js-ledger-col flex min-w-0 flex-col gap-6">
              <DemoCard />
              <SupportChannelsCard />
            </div>
            <div className="js-ledger-col min-w-0">
              <ContactForm />
            </div>
          </ContactLedger>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
