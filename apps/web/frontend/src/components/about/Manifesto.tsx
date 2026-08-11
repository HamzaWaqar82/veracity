"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { TiltCard } from "@/components/common/TiltCard";
import { manifesto } from "./about-data";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
        enter
          .fromTo(
            q(".js-manifesto-h"),
            { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(
            q(".js-manifesto-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-manifesto-card"),
            { opacity: 0, y: 34, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.95 },
            "-=0.45",
          )
          .fromTo(
            q(".js-manifesto-row"),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
            "-=0.6",
          )
          .fromTo(
            q(".js-manifesto-stamp"),
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.5 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="manifesto"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-manifesto-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Five principles, signed on day one.
        </h2>
        <p className="js-manifesto-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          These are the rules Veracity was built on. Each one is an architectural commitment, not a
          policy statement - enforced in the Agent, the encryption, and the audit trail.
        </p>

        <div className="js-manifesto-card mt-12 [perspective:1400px]">
          <TiltCard
            maxAngle={2}
            className="overflow-hidden rounded-2xl border border-line bg-white"
          >
          <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
              THE FAIR MONITORING MANIFESTO
            </p>
            <p className="text-xs font-semibold text-on-dark-muted">FIVE PRINCIPLES</p>
          </div>

          <ol className="divide-y divide-line">
            {manifesto.map((principle) => (
              <li
                key={principle.n}
                className="js-manifesto-row group grid gap-4 px-5 py-7 transition-colors duration-300 hover:bg-surface sm:grid-cols-[7rem_1fr] sm:px-8"
              >
                <span className="font-display text-4xl font-semibold tracking-tight text-primary/60 transition-colors duration-300 group-hover:text-primary sm:text-5xl">
                  {principle.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                    {principle.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">
                    {principle.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="js-manifesto-stamp flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-primary-soft px-5 py-3 sm:px-8">
            <p className="text-[0.8125rem] font-semibold text-primary">
              The principles that started Veracity
            </p>
            <p className="text-[0.8125rem] font-semibold text-primary">
              Commitments, not policy
            </p>
          </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
