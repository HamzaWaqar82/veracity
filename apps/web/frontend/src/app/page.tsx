import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Problem } from "@/components/home/Problem";
import { Approach } from "@/components/home/Approach";
import { Principles } from "@/components/home/Principles";
import { HowItWorks } from "@/components/home/HowItWorks";
import { States } from "@/components/home/States";
import { Plans } from "@/components/home/Plans";
import { Compliance } from "@/components/home/Compliance";
import { Faq } from "@/components/home/Faq";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: {
    absolute: "Workforce Analytics for Remote Teams | Veracity",
  },
  description:
    "Workforce analytics for SMBs with remote and hybrid teams. Get verifiable productivity data your employees can see in real time, without surveillance or stealth mode.",
  openGraph: {
    title: "Workforce Analytics for Remote Teams | Veracity",
    description:
      "Workforce analytics for SMBs with remote and hybrid teams. Verifiable productivity data your employees can see, with no keystroke logging and no stealth mode.",
    type: "website",
  },
  alternates: { canonical: "/" },
};

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Veracity",
    url: "/",
    description: "Workforce analytics built on trust, not surveillance.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Veracity",
    url: "/",
    slogan: "Workforce Analytics Built on Trust, Not Surveillance",
    description:
      "Workforce analytics for small-to-medium businesses with remote and hybrid teams, built on employee-visible monitoring and structural privacy guarantees.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Veracity",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Windows, macOS, Linux",
    description:
      "Cloud-native workforce analytics with employee-visible monitoring, published productivity scoring, and compliance-first design. No keystroke logging, no stealth mode.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "6", priceCurrency: "USD" },
      { "@type": "Offer", name: "Growth", price: "12", priceCurrency: "USD" },
      { "@type": "Offer", name: "Enterprise", price: "24", priceCurrency: "USD" },
    ],
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero />
      <Problem />
      <Approach />
      <Principles />
      <HowItWorks />
      <States />
      <Plans />
      <Compliance />
      <Faq />
      <Testimonials />
      <FinalCta />
    </>
  );
}
