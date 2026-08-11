"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, REVEAL, MOTION } from "@/lib/motion";
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
          defaults: { ease: REVEAL.to.ease },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        enter
          .fromTo(q(".js-out-h"), REVEAL.from, REVEAL.to)
          .fromTo(
            q(".js-out-item"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4",
          );

        const values = gsap.utils.toArray<HTMLElement>(".js-out-val", root.current!);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 62%",
          once: true,
          onEnter: () => {
            values.forEach((el) => {
              const raw = el.dataset.value;
              if (!raw) return;
              const match = raw.match(/^([0-9,]+)(.*)$/);
              if (!match) return;
              const target = parseFloat(match[1].replace(/,/g, ""));
              const suffix = match[2];
              const obj = { v: 0 };
              gsap.to(obj, {
                v: target,
                duration: 1.4,
                ease: REVEAL.to.ease,
                onUpdate: () => {
                  el.textContent = `${Math.round(obj.v)}${suffix}`;
                },
              });
            });
          },
        });
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
              <p
                data-value={item.value}
                className="js-out-val font-display text-4xl font-semibold tracking-tight text-on-dark lg:text-5xl"
              >
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
