import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Veracity handles the data its workforce-analytics Agent collects, what it deliberately never collects, and what employees can see about themselves.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-x py-section pt-32">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Last updated: August 2026
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-muted">
          Veracity is a workforce-analytics platform built on data minimization. We collect only the
          minimum data needed for productivity analytics, employees can always see their own data,
          and a set of deliberate exclusions applies at every tier.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          What the Agent collects
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          The Veracity Agent records activity on the workstation it is installed on:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-primary">
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            Application usage - application name, executable path, process ID, and active time at
            60-second heartbeat intervals
          </li>
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            Window titles - the active window title text
          </li>
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            URL visits - browser domain by default, or full URL path as an opt-in policy setting
          </li>
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            Activity states - ACTIVE, PASSIVE, IDLE, and PRIVATE_TIME transitions
          </li>
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            USB device events - connection and disconnection identifiers only, never content
          </li>
          <li className="text-[1.0625rem] leading-relaxed text-ink/90">
            File operations - creation, rename, and deletion events, paths only, never content
          </li>
        </ul>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          On Growth and Enterprise plans the Agent also captures periodic screenshots. Screenshots
          are JPEG at quality 80, EXIF-stripped, encrypted, and redacted by default - they are shown
          to managers only after explicit review requests.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          What we deliberately never collect
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          The following are architectural constraints, not configuration options, and apply at all
          tiers: keystrokes and keyboard input content, audio, video, continuous screen recordings
          (periodic screenshots only), file contents (paths only), network traffic content, email
          content, biometric data, location data, social media activity, and any data from non-work
          devices. The Agent is always visible and identifiable - there is no stealth mode.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Employee access and rights
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Every employee can see their own data in real time through an identical dashboard, and the
          productivity scoring methodology is published. Disputes are handled through the review
          workflow, and Data Subject Access Requests are supported through the compliance tools. See
          the{" "}
          <a
            href="/compliance"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            Compliance page
          </a>{" "}
          for retention and portability details.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          The site assistant
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Conversations with the site assistant are kept in your browser&apos;s local storage only.
          No account or login is required to use it, and your conversation history is not uploaded
          or retained by Veracity.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Security
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Data is encrypted with TLS 1.3 in transit and AES-256 at rest.
        </p>

        <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
          Contact
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/90">
          Questions about this policy can be sent to{" "}
          <a
            href="mailto:privacy@veracity.dev"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            privacy@veracity.dev
          </a>
          .
        </p>
      </div>
    </div>
  );
}
