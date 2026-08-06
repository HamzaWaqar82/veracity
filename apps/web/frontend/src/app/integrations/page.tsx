import type { Metadata } from "next";
import { IntegrationsHero } from "@/components/integrations/IntegrationsHero";
import { IntegrationsGrid } from "@/components/integrations/IntegrationsGrid";
import { RestApi } from "@/components/integrations/RestApi";
import { Roadmap } from "@/components/integrations/Roadmap";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Veracity integrations: Slack, Jira, Asana, Google Calendar, and the REST API with published rate limits. Connect the tools your team already uses — included in every plan.",
  alternates: { canonical: "/integrations" },
};

export default function IntegrationsPage() {
  return (
    <>
      <IntegrationsHero />
      <IntegrationsGrid />
      <RestApi />
      <Roadmap />
      <FinalCta />
    </>
  );
}
