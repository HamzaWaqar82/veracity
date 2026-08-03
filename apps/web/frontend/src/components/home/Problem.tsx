"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";

const fallout = [
  "Employees feel watched, and good people leave.",
  "Managers get raw data they cannot act on.",
  "Performance conversations turn personal, not constructive.",
];

export function Problem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        tl.fromTo(
          q(".js-problem-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-problem-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-problem-item"),
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 },
            "-=0.2",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section">
      <div className="container-x">
        <h2 className="js-problem-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          You Cannot Manage What You Cannot See.
        </h2>
        <p className="js-problem-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Remote and hybrid work has made it harder for managers to see how their teams actually
          spend their time. The usual response — surveillance software that captures everything,
          hides itself from employees, and reports activity with no context — makes it worse. It
          erodes trust, drives away talent, and hands managers data they cannot use.
        </p>
        <ul className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
          {fallout.map((item) => (
            <li key={item} className="js-problem-item text-base font-medium leading-snug">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          <Link
            href="/why-veracity"
            className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
          >
            Why transparent employee monitoring works better
          </Link>{" "}
          than surveillance — and where Veracity draws the line.
        </p>
      </div>
    </section>
  );
}
