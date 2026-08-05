import type { Metadata } from "next";
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

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Manifesto />
      <Story />
      <Team />
      <ContactSection />
      <FinalCta />
    </>
  );
}
