"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { roiSections } from "./why-data";

export function Roi() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-roi-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-roi-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-roi-block"),
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12 },
            "-=0.35",
          );

        gsap.utils.toArray<HTMLElement>(".js-roi-block", root.current!).forEach((block) => {
          const pull = block.querySelector<HTMLElement>(".js-roi-pull");
          const rule = block.querySelector<HTMLElement>(".js-roi-rule-bar");
          const draw = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: block, start: "top 84%", end: "top 56%", scrub: 0.6 },
          });
          if (pull) {
            draw.fromTo(pull, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5 });
          }
          if (rule) {
            draw.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.45 }, 0.05);
          }
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="the-roi-of-transparent-monitoring" ref={root} className="scroll-mt-28 py-section">
      <div className="container-x">
        <h2 className="js-roi-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The ROI of transparent monitoring.
        </h2>
        <p className="js-roi-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Transparency is not a trade-off you make for better analytics — it is what makes the
          analytics worth having. Three returns, stated plainly.
        </p>

        <div className="mt-12 border-t border-line">
          {roiSections.map((section) => (
            <div
              key={section.id}
              className="js-roi-block grid gap-6 border-b border-line py-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16 lg:py-12"
            >
              <div>
                <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  {section.title}
                </p>
                <div className="js-roi-rule mt-4 h-px overflow-hidden" aria-hidden="true">
                  <div className="js-roi-rule-bar h-full w-full origin-left bg-primary/30" />
                </div>
              </div>
              <div>
                <p className="js-roi-pull max-w-3xl font-display text-2xl font-semibold leading-snug sm:text-3xl">
                  {section.lead}
                </p>
                <p className="mt-5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted">
                  {section.pull}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
