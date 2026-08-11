import type { Metadata } from "next";
import { SITE_URL, SOCIAL } from "@/lib/site";
import { AboutHero } from "@/components/about/AboutHero";
import { Manifesto } from "@/components/about/Manifesto";
import { Story } from "@/components/about/Story";
import { Team } from "@/components/about/Team";
import { ContactSection } from "@/components/contact/ContactSection";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Veracity exists: the Fair Monitoring Manifesto, the story behind the platform, the founding team, and how to reach us. Workforce analytics built on trust, not surveillance.",
  alternates: { canonical: "/about" },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Veracity",
  url: `${SITE_URL}/about`,
  logo: `${SITE_URL}/icon.svg`,
  slogan: "Workforce Analytics Built on Trust, Not Surveillance",
  description:
    "Veracity builds workforce analytics for small-to-medium businesses with remote and hybrid teams - employee-visible monitoring, published productivity scoring, and compliance-first design.",
  sameAs: SOCIAL.map((s) => s.href),
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <AboutHero />
      <Manifesto />
      <Story />
      <Team />
      <ContactSection />
      <FinalCta />
    </>
  );
}
