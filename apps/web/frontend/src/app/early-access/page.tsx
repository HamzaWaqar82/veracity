import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Early Access",
  description:
    "Veracity is in early access. Pre-register now and you will get a 14-day free trial with full access to every feature of your chosen plan, with no credit card and no seat minimum.",
};

const promises = [
  {
    title: "A real 14-day trial",
    body: "Full access to every feature of the plan you choose, with no credit card required.",
  },
  {
    title: "No seat minimum",
    body: "Start with a single user, then grow as your team does.",
  },
  {
    title: "Priority onboarding",
    body: "The guided setup wizard gets you running in under 30 minutes.",
  },
];

export default function EarlyAccessPage() {
  return (
    <div className="bg-mint text-hero-ink">
      <main className="container-x pb-28 pt-32 sm:pt-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-hero-muted transition-colors hover:text-hero-ink"
        >
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <h1 className="mt-8 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Veracity is in early access.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-hero-muted">
          We are building the product with the SMB operators and compliance leads who will use it,
          and we would rather sign you up honestly than send you to a trial that does not exist
          yet. Pre-register now, and the moment it launches you start a 14-day free trial with full
          access to every feature of the plan you choose.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {promises.map((p) => (
            <li key={p.title} className="rounded-2xl border border-line bg-bg p-6">
              <h2 className="font-display text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            href="mailto:sales@veracity.dev?subject=Veracity%20early%20access"
            className="btn btn-lg btn-primary"
          >
            Email sales@veracity.dev to join
          </a>
          <Link href="/pricing" className="btn btn-lg btn-outline">
            See Pricing
          </Link>
        </div>
        <p className="mt-8 max-w-xl text-sm leading-relaxed text-hero-muted">
          Sales inquiries are answered within one business day. Tell us your team size and which
          features matter most, and we will save you a spot.
        </p>
      </main>
    </div>
  );
}
