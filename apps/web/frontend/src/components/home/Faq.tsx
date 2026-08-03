import { ChevronIcon } from "@/components/icons";

const faqs = [
  {
    q: "What is Veracity, and how does it differ from employee monitoring software?",
    a: "Veracity is a workforce-analytics platform built for small-to-medium businesses with 10 to 200 employees. Unlike surveillance tools, it tracks only what productivity analytics require, shows every employee the same data their manager sees, and never operates in secret. There is no keystroke logging, no continuous video, and no stealth mode at any tier.",
  },
  {
    q: "What data does Veracity collect from employees?",
    a: "The Agent captures application names, window titles, and URL domains at sixty-second heartbeat intervals. On Growth and Enterprise plans, optional screenshots run at fixed intervals with client-side redaction and encryption. Veracity never logs keystrokes, records audio or video, or captures webcam or microphone data.",
  },
  {
    q: "Can employees see the data Veracity collects about them?",
    a: "Yes. Every employee has a personal dashboard showing exactly what Veracity has collected, in real time, with the same data their manager sees. A complete access log shows who viewed their data and when. Private Time pauses all capture with one click, and only the session duration is recorded.",
  },
  {
    q: "Is Veracity compliant with GDPR, the EU AI Act, and US monitoring laws?",
    a: "Veracity is built to comply with the General Data Protection Regulation (GDPR), the EU Artificial Intelligence Act, and US state electronic monitoring statutes including Connecticut General Statute §31-48d and New York Labor Law §52-c. It includes jurisdiction-aware notice engines, tamper-evident audit logging, automated data retention, DSAR workflows, and DPIA support, and performs no emotion recognition or biometric categorization.",
  },
  {
    q: "How much does Veracity cost, and is there a free trial?",
    a: "Veracity starts at $6 per user per month (Starter), $12 (Growth), and $24 (Enterprise), with no seat minimum and no add-on creep. Every plan includes a 14-day free trial with full access to all features of your chosen plan — no credit card required.",
  },
  {
    q: "When is Veracity not the right fit?",
    a: "Veracity is honest about where it does not fit. It is not a security or DLP product, does not run on-premise, and is not designed for enterprises beyond 200 employees. If your goal is covert monitoring, Veracity is the wrong tool by design.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-line py-section">
      <div className="container-x">
        <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Frequently Asked Questions About Workforce Analytics
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Straight answers about what Veracity tracks, what it never tracks, and where it does not
          fit.
        </p>
        <div className="mt-12">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line first:border-t">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {f.q}
                </h3>
                <ChevronIcon className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="max-w-[70ch] pb-7 text-[0.9375rem] leading-relaxed text-muted sm:text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}
