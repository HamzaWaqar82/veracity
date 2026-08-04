"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";

const headlineWords = "Insights on transparent workforce analytics.".split(" ");

const jumpLinks = [
  { label: "Reading list", href: "#reading-list" },
  { label: "Subscribe", href: "#subscribe" },
];

export function BlogHero() {
  const root = useRef<HTMLElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-blog-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-blog-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div className="container-x pb-14 pt-32 text-center sm:pt-40 lg:pt-44">
        <p
          ref={badge}
          className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
        >
          Veracity Blog
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headlineWords.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                <span className="js-blog-word inline-block will-change-transform">{word}</span>
              </span>
              {i < headlineWords.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p ref={lede} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
          Thought leadership, product deep-dives, and practical guides for building trust-driven
          productivity cultures in small-to-medium businesses.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#reading-list" className="btn btn-lg btn-primary js-blog-cta">
            Read the articles
          </a>
          <a href="mailto:support@veracity.dev" className="btn btn-lg btn-outline-hero js-blog-cta">
            Suggest a topic
          </a>
        </div>
        <p
          ref={note}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted"
        >
          <span>New articles published monthly</span>
        </p>
      </div>

      <div className="container-x pb-24 sm:pb-28 lg:pb-32">
        <SectionJumpNav ariaLabel="Blog sections" links={jumpLinks} />
      </div>
    </section>
  );
}
