"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { roadmap } from "./integrations-data";

export function Roadmap() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        enter
          .fromTo(q(".js-rm-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-rm-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-rm-row"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="roadmap" ref={root} className="scroll-mt-28 border-t border-line bg-surface py-section">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:self-start">
          <h2 className="js-rm-h max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Planned, not shipped.
          </h2>
          <p className="js-rm-lead mt-6 max-w-xl text-lg leading-relaxed text-muted">
            These integrations are on the roadmap but not yet available. We build what customers
            ask for — tell us what you need.
          </p>
          <div className="mt-8">
            <a href="mailto:sales@veracity.dev" className="btn btn-primary js-rm-cta">
              Request an integration
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_28px_60px_-28px_rgba(27,67,50,0.22)]">
          <div className="flex items-center justify-between bg-ink px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">ROADMAP</p>
            <p className="text-xs font-semibold text-on-dark-muted">NOT YET AVAILABLE</p>
          </div>
          <div className="divide-y divide-line">
            {roadmap.map((item) => (
              <div key={item.name} className="js-rm-row flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-6 sm:px-6">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">{item.tag}</p>
                </div>
                <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                  On the roadmap
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
