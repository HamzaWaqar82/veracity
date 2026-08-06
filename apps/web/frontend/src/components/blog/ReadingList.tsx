"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import type { Essay } from "@/lib/blog";

export function ReadingList({ essays }: { essays: Essay[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
        enter
          .fromTo(
            q(".js-rl-h"),
            { autoAlpha: 0, y: 26, clipPath: "inset(0 0 100% 0)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(
            q(".js-rl-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-rl-card"),
            { autoAlpha: 0, y: 32 },
            { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.1 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="reading-list"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-rl-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The reading list.
        </h2>
        <p className="js-rl-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Three articles, published and indexed. Each one stands alone — start anywhere.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {essays.map((essay, index) => (
            <Link
              key={essay.slug}
              href={`/resources/${essay.slug}`}
              className="js-rl-card group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_28px_60px_-28px_rgba(27,67,50,0.22)] transition-colors duration-300 hover:border-primary/40"
            >
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                  ARTICLE {String(index + 1).padStart(2, "0")}
                </p>
                <p className="text-xs font-semibold text-on-dark-muted">{essay.readTime}</p>
              </div>
              <div className="flex flex-1 flex-col px-6 py-7">
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-primary">
                  {essay.title}
                </h3>
                <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                  {essay.deck}
                </p>
                <p className="mt-6 flex items-center gap-2 text-[0.875rem] font-bold text-primary">
                  Read the full article
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
