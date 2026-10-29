"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { fitFor, notFitFor } from "./why-data";

export function NotRightFit() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        q(".js-draw").forEach((path) => {
          const len = (path as unknown as SVGPathElement).getTotalLength();
          if (!len) return;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-fit-h"),
          { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-fit-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-fit-col"),
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.65, stagger: 0.12 },
            "-=0.35",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut", stagger: 0.08 }, "-=0.4");
      });
    },
    { scope: root },
  );

  return (
    <section
      id="when-veracity-is-not-the-right-fit"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-fit-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          When Veracity is not the right fit.
        </h2>
        <p className="js-fit-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Veracity is designed for specific use cases and is intentionally not suitable for others.
          Both lists are stated just as plainly.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="js-fit-col rounded-2xl border border-line bg-bg p-7 transition-transform duration-200 ease-out hover:-translate-y-1 sm:p-9">
            <header className="flex items-center gap-3">
              <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                <CheckIcon pathClassName="js-draw" className="size-3.5" />
              </span>
              <h3 className="font-display text-xl font-semibold">Veracity is for</h3>
            </header>
            <ul className="mt-6 space-y-4">
              {fitFor.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pine" />
                  <span className="text-[0.9375rem] leading-relaxed text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="js-fit-col rounded-2xl border border-line bg-bg p-7 transition-transform duration-200 ease-out hover:-translate-y-1 sm:p-9">
            <header className="flex items-center gap-3">
              <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-accent text-white">
                <MinusIcon pathClassName="js-draw" className="size-3.5" />
              </span>
              <h3 className="font-display text-xl font-semibold">Veracity is not for</h3>
            </header>
            <ul className="mt-6 space-y-4">
              {notFitFor.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-[0.9375rem] leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
