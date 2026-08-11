"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";
import { CTA } from "@/lib/cta";

const headlineWords = "See Veracity before you commit.".split(" ");

export function DemoHero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
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
            q(".js-demo-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-demo-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16);

        gsap.to(content.current, {
          y: -56,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      });

      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.desktop) return;
        const magneticCleanups = gsap.utils
          .toArray<HTMLElement>(".js-demo-cta", root.current!)
          .map((el) => attachMagnetic(el, 140, 0.4));
        return () => magneticCleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div ref={content} className="container-x relative pt-32 text-center sm:pt-40 lg:pt-44">
        <p
          ref={badge}
          className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
        >
          Live demo · 30 minutes · Your workflows
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headlineWords.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                <span className="js-demo-word inline-block will-change-transform">{word}</span>
              </span>
              {i < headlineWords.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p ref={lede} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
          A walkthrough of the Agent, the manager dashboard, and the employee self-service portal - shown against the way your team actually works. No slideware, no pressure.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="#demo-form" className="btn btn-lg btn-primary js-demo-cta">
            Book a time
          </Link>
          <Link href={CTA.trial} className="btn btn-lg btn-outline-hero js-demo-cta">
            Start a free trial instead
          </Link>
        </div>
        <p ref={note} className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted">
          <span>Response within one business day</span>
          <span className="text-hero-line" aria-hidden="true">·</span>
          <span>Available Mon - Fri, 9 AM - 6 PM UTC</span>
        </p>
      </div>
    </section>
  );
}
