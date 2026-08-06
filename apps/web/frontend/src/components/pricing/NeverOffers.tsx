"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { attachSpotlight } from "@/lib/cursor";
import { MinusIcon } from "@/components/icons";
import { neverOffers, deferredOffers } from "./pricing-data";

export function NeverOffers() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const spotlight = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        q(".js-draw").forEach((path) => {
          const el = path as unknown as SVGPathElement;
          const len = el.getTotalLength();
          if (!len) return;
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        tl.fromTo(
          q(".js-never-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-never-card"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
            "-=0.4",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut", stagger: 0.04 }, "-=0.5")
          .fromTo(
            q(".js-never-stamp"),
            { autoAlpha: 0, scale: 0.6, rotation: -18 },
            { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.6 },
            "-=0.3",
          );
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        if (spotlight.current && panel.current) {
          const cleanup = attachSpotlight(spotlight.current);
          return () => cleanup();
        }
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="never"
      className="scroll-mt-28 py-section"
      aria-labelledby="never-heading"
    >
      <div className="container-x">
        <div
          ref={panel}
          className="relative overflow-hidden rounded-[2rem] bg-primary-deep px-6 py-12 sm:px-10 lg:px-16 lg:py-16"
        >
          <div
            ref={spotlight}
            aria-hidden="true"
            className="cta-spotlight pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "42rem",
              height: "42rem",
              marginLeft: "-21rem",
              marginTop: "-21rem",
            }}
          />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
            <div>
              <p className="js-never-h text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-on-dark">
                What we never do
              </p>
              <h2
                id="never-heading"
                className="js-never-h mt-4 font-display text-3xl font-semibold leading-tight text-on-dark sm:text-4xl lg:text-5xl"
              >
                These terms are signed, not sorry.
              </h2>
              <p className="js-never-h mt-6 max-w-md text-[0.9375rem] leading-relaxed text-on-dark-muted">
                The refusal list is part of every contract, every plan, every trial. It is not a
                policy doc we can silently change.
              </p>
              <div
                className="js-never-stamp mt-10 inline-flex size-28 flex-col items-center justify-center rounded-full border-2 border-accent-soft/70 text-center text-accent-soft"
                aria-hidden="true"
              >
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
                  Sealed
                </span>
                <span className="mt-1 text-[0.9375rem] font-bold uppercase tracking-[0.14em]">
                  Not Sorry
                </span>
              </div>
            </div>

            <div>
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {neverOffers.map((item) => (
                  <li key={item.title} className="js-never-card">
                    <div className="flex items-start gap-3.5 rounded-2xl border border-on-dark-line bg-pine/15 p-5 transition-transform duration-200 ease-out hover:-translate-y-1">
                      <MinusIcon
                        pathClassName="js-draw"
                        className="mt-0.5 size-5 shrink-0 text-accent-soft"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-semibold text-on-dark">{item.title}</h3>
                        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-on-dark-muted">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="js-never-card mt-6 rounded-2xl border border-dashed border-on-dark-line p-5">
                <h3 className="font-semibold text-on-dark">Deferred, not refused</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-on-dark-muted">
                  {deferredOffers.map((item) => (
                    <span key={item.title}>
                      <span className="font-medium text-on-dark">{item.title}.</span> {item.body}{" "}
                    </span>
                  ))}
                  Roadmap items are future capabilities, not part of the signed refusal list above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
