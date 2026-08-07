import type { Metadata } from "next";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FinalCta } from "@/components/home/FinalCta";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";
import { FaqSearch } from "@/components/faq/FaqSearch";
import { ChevronIcon } from "@/components/icons";
import { buildFaqSchema, loadFaqCategories } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently Asked Questions about Veracity's platform, pricing, compliance, and setup.",
  alternates: { canonical: "/faq" },
};

const answerComponents: Components = {
  p: ({ children }) => (
    <p className="mb-4 text-[1.0625rem] leading-relaxed text-ink/90 last:mb-0">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 marker:text-primary last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 marker:text-primary last:mb-0">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[1.0625rem] leading-relaxed text-ink/90">{children}</li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-primary">
      {children}
    </code>
  ),
};

export default function FaqPage() {
  const categories = loadFaqCategories();
  const schema = buildFaqSchema(categories);
  const jumpLinks = categories.map((category) => ({
    label: category.title.split(/\s+/)[0],
    href: `#${category.id}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section className="bg-mint text-hero-ink">
        <div className="container-x pb-20 pt-32 sm:pt-40">
          <p className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]">
            Direct answers · No runaround
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-hero-muted">
            The same answers the platform gives, written plainly - what we collect, what we never
            collect, how pricing works, and how to get started.
          </p>
          {jumpLinks.length > 0 && (
            <div className="mt-12">
              <SectionJumpNav ariaLabel="FAQ sections" links={jumpLinks} />
            </div>
          )}
        </div>
      </section>

      <div className="container-x py-20">
        {categories.length === 0 ? (
          <p className="mx-auto max-w-3xl text-center text-muted">
            FAQ content is temporarily unavailable.{" "}
            <a
              href="mailto:support@veracity.dev?subject=Veracity%20question"
              className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Contact support
            </a>
            .
          </p>
        ) : (
          <>
            <FaqSearch categories={categories} />
            <div className="mx-auto max-w-3xl">
              {categories.map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-24 border-t border-line py-16"
                >
                  <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {category.title}
                  </h2>
                  <div className="space-y-4">
                    {category.qas.map((qa) => (
                      <details
                        key={qa.id}
                        id={qa.id}
                        className="group scroll-mt-24 rounded-2xl border border-line bg-white"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-2xl px-6 py-5 transition-colors hover:bg-mint/30 [&::-webkit-details-marker]:hidden">
                          <span className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                            {qa.question}
                          </span>
                          <ChevronIcon className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="px-6 pb-6">
                          <div className="border-t border-line/70 pt-5">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={answerComponents}
                            >
                              {qa.answer}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      <FinalCta />
    </>
  );
}
