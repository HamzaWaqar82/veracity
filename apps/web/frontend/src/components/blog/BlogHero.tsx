"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";
import { ArrowIcon } from "@/components/icons";
import type { Essay } from "@/lib/blog";

const headlineWords = "Insights on transparent workforce analytics.".split(" ");

const jumpLinks = [
  { label: "Reading list", href: "#reading-list" },
  { label: "Subscribe", href: "#subscribe" },
];

export function BlogHero({ featured }: { featured?: Essay }) {
  const root = useRef<HTMLElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const meta = useRef<HTMLParagraphElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-blog-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { y: 22 }, { y: 0, duration: 0.7 }, 0.85)
          .fromTo(meta.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.05)
          .fromTo(
            card.current,
            { opacity: 0, x: 56, scale: 0.97 },
            { opacity: 1, x: 0, scale: 1, duration: 0.9 },
            0.6,
          )
          .fromTo(jump.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, 1.2);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div className="container-x grid items-center gap-14 pb-16 pt-32 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-44">
        <div className="min-w-0">
          <p
            ref={badge}
            className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
          >
            Veracity Resources
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                  <span className="js-blog-word inline-block will-change-transform">{word}</span>
                </span>
                {i < headlineWords.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p ref={lede} className="mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
            Thought leadership, product deep-dives, and practical guides for building trust-driven
            productivity cultures in small-to-medium businesses.
          </p>
          <p
            ref={meta}
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-hero-muted"
          >
            <span>Published monthly</span>
            <span className="text-hero-line" aria-hidden="true">·</span>
            <span>Written by the Veracity team</span>
          </p>
        </div>

        {featured ? (
          <div className="min-w-0">
            <div ref={card} className="mx-auto w-full max-w-[30rem] lg:max-w-none">
              <Link
                href={`/resources/${featured.slug}`}
                className="group block rounded-2xl border border-hero-line/70 bg-white/40 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-hero-line"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold tracking-[0.16em] text-primary">
                    FEATURED · LATEST
                  </p>
                  <p className="shrink-0 text-xs font-semibold text-hero-muted">
                    {featured.readTime}
                  </p>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-hero-ink transition-colors duration-300 group-hover:text-primary">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-hero-muted">
                  {featured.deck}
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read the article
                  <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </p>
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <div className="container-x pb-24 sm:pb-28 lg:pb-32">
        <div ref={jump}>
          <SectionJumpNav ariaLabel="Resources sections" links={jumpLinks} />
        </div>
      </div>
    </section>
  );
}
