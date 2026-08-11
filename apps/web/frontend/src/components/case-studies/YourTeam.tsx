"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";
import { CTA } from "@/lib/cta";

export function YourTeam() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        enter
          .fromTo(q(".js-yours-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-yours-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-yours-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            "-=0.3",
          );
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const magneticCleanups = gsap.utils
          .toArray<HTMLElement>(".js-yours-cta", root.current!)
          .map((el) => attachMagnetic(el, 140, 0.4));
        return () => magneticCleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section id="your-team" ref={root} className="scroll-mt-28 border-t border-line bg-white py-section">
      <div className="container-x text-center">
        <h2 className="js-yours-h mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Your team, next.
        </h2>
        <p className="js-yours-lead mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Veracity is purpose-built for small-to-medium businesses with 10 to 200 employees - remote-first, hybrid, or in the office. Start with a 14-day free trial, no
          credit card required, or talk to us about a live walkthrough.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={CTA.trial} className="btn btn-lg btn-primary js-yours-cta">
            Start Free Trial
          </Link>
          <a href="mailto:sales@veracity.dev" className="btn btn-lg btn-outline js-yours-cta">
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}
