"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { digest } from "./case-studies-data";

export function Outcomes() {
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
          .fromTo(q(".js-out-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-out-item"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="outcomes" ref={root} className="scroll-mt-28 bg-primary-deep py-section">
      <div className="container-x">
        <h2 className="js-out-h max-w-3xl font-display text-3xl font-semibold leading-tight text-on-dark sm:text-4xl lg:text-5xl">
          The outcomes, across all three reports.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {digest.map((item) => (
            <div key={item.label} className="js-out-item">
              <p className="font-display text-4xl font-semibold tracking-tight text-on-dark lg:text-5xl">
                {item.value}
              </p>
              <p className="mt-3 max-w-[16rem] text-[0.9375rem] leading-snug text-on-dark-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
