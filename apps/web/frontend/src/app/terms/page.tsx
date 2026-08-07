import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of the veracity.dev website and the Veracity workforce-analytics platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-x py-section pt-32">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Last updated: August 2026
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-muted">
          These terms govern your use of the Veracity website and platform. By using Veracity you
          agree to them.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Eligibility and scope
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Veracity is built for small-to-medium businesses with 10 to 200 employees. You are
          responsible for how your organization uses the platform, including providing notice to
          employees as required by applicable law. Veracity provides the consent management, policy
          acknowledgment, and jurisdiction-aware notice templates to support this.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Plans and billing
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          All plans include a 14-day free trial with no credit card required and no seat minimum.
          Published per-user prices are shown on the{" "}
          <a
            href="/pricing"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            pricing page
          </a>
          . Data collected during a trial is preserved if you convert to a paid plan.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Acceptable use
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          You will use Veracity in compliance with applicable laws, including the GDPR, the EU AI
          Act, and state electronic monitoring statutes in the jurisdictions you operate in. You may
          not use Veracity to collect data the platform is explicitly built not to collect, or to
          circumvent its privacy defaults.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Data
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          How the Agent collects, stores, and protects data is described in the{" "}
          <a
            href="/privacy"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            Privacy Policy
          </a>{" "}
          and the{" "}
          <a
            href="/compliance"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            Compliance page
          </a>
          .
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Termination
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          You may stop using Veracity and cancel your plan at any time. On cancellation, data
          handling follows the retention and portability terms described in our compliance
          documentation.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Changes to these terms
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          We may update these terms from time to time. Material changes will be reflected on this
          page with an updated effective date.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Contact
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Questions about these terms can be sent to{" "}
          <a
            href="mailto:legal@veracity.dev"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            legal@veracity.dev
          </a>
          .
        </p>
      </div>
    </div>
  );
}
