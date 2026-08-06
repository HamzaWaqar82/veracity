"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { attachNudge } from "@/lib/cursor";
import { CheckIcon } from "@/components/icons";
import { falseChoiceBeliefs } from "./why-data";

export function FalseChoice() {
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
          q(".js-false-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-false-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-false-row"),
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 },
            "-=0.35",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut", stagger: 0.06 }, "-=0.4");
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const cleanups = gsap.utils.toArray<HTMLElement>(".js-false-row", root.current!).flatMap((row) => {
          const icon = row.querySelector<HTMLElement>("[aria-hidden='true']");
          return icon ? [attachNudge(icon)] : [];
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section id="the-false-choice-visibility-or-trust" ref={root} className="scroll-mt-28 py-section">
      <div className="container-x">
        <h2 className="js-false-h max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The false choice: visibility or trust.
        </h2>
        <p className="js-false-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The tools in this category — including Hubstaff, Time Doctor, Teramind, and ActivTrak —
          were built for a world where more data is always better, employee notice is optional, and
          productivity scores are black boxes. Veracity rejects this framing.
        </p>

        <ul className="mt-12 overflow-hidden rounded-2xl border border-line bg-bg">
          {falseChoiceBeliefs.map((belief) => (
            <li
              key={belief.title}
              className="js-false-row border-b border-line px-6 py-7 transition-colors duration-300 hover:bg-surface last:border-b-0 sm:px-9 sm:py-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <CheckIcon pathClassName="js-draw" className="size-4" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold sm:text-2xl">{belief.title}</h3>
                  <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted">
                    {belief.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
