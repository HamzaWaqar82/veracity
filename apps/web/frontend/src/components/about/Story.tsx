"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { story, sectors } from "./about-data";

export function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = !!ctx.conditions?.desktop;

        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
        enter
          .fromTo(
            q(".js-story-kicker"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
          )
          .fromTo(
            q(".js-story-h"),
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            "-=0.35",
          )
          .fromTo(
            q(".js-story-para"),
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 },
            "-=0.5",
          )
          .fromTo(
            q(".js-story-band"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            "-=0.4",
          );

        if (desktop) {
          gsap.to(q(".js-story-sticky"), {
            y: -48,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 20%", end: "bottom top", scrub: 0.6 },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section id="story" ref={root} className="scroll-mt-28 bg-white py-section">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="js-story-sticky lg:self-start">
          <p className="js-story-kicker text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Our story
          </p>
          <h2 className="js-story-h mt-4 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            An internal tool that outgrew its purpose.
          </h2>
        </div>

        <div>
          <div className="space-y-6">
            {story.map((paragraph, i) => (
              <p
                key={i}
                className="js-story-para max-w-2xl text-lg leading-relaxed text-ink/90"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="js-story-band mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            <div className="bg-surface px-6 py-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Built for</p>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
                SMBs with 10 to 200 employees
              </p>
            </div>
            <div className="bg-surface px-6 py-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Serving</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <span
                    key={sector}
                    className="rounded-full border border-line px-3 py-1 text-[0.8125rem] font-semibold text-ink"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
