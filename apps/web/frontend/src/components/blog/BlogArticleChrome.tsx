import Link from "next/link";
import { essays, getEssay, type Essay } from "@/lib/blog";

export function BlogArticleHeader({ essay, index }: { essay: Essay; index: number }) {
  return (
    <section className="border-b border-line bg-mint text-hero-ink">
      <div className="container-x pb-16 pt-32 text-center sm:pt-40 lg:pt-44">
        <p className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]">
          Veracity Blog · Article {String(index + 1).padStart(2, "0")}
        </p>
        <h1 className="mx-auto mt-7 max-w-3xl font-display text-[clamp(2.25rem,3.4vw+1.2rem,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
          {essay.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-hero-muted">
          {essay.deck}
        </p>
        <p className="mt-6 text-sm font-semibold text-hero-muted">{essay.readTime}</p>
      </div>
    </section>
  );
}

export function KeepReading({ current }: { current: string }) {
  const others = essays.filter((e) => e.slug !== current);
  if (others.length === 0) return null;
  return (
    <section className="border-t border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Keep reading.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {others.map((essay) => (
            <Link
              key={essay.slug}
              href={`/blog/${essay.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-colors duration-300 hover:border-primary/40"
            >
              <p className="text-xs font-semibold text-muted">{essay.readTime}</p>
              <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-primary">
                {essay.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{essay.deck}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
