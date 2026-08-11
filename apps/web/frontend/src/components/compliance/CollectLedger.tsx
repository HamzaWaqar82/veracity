"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { MinusIcon } from "@/components/icons";
import { TiltCard } from "@/components/common/TiltCard";
import { collectRows, neverRows } from "./compliance-data";

export function CollectLedger() {
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
            q(".js-ledger-h"),
            { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(
            q(".js-ledger-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-ledger-col"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 },
            "-=0.45",
          )
          .fromTo(
            q(".js-ledger-row"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.03 },
            "-=0.6",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="data-collection-what-we-collect-and-what-we-do-not"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-ledger-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          What we collect - and what we never will.
        </h2>
        <p className="js-ledger-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Eleven data types, ten architectural refusals. Everything we capture is published with its
          retention; everything we refuse is refused at every tier, in every jurisdiction.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="js-ledger-col [perspective:1400px]">
            <TiltCard
              maxAngle={2}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
            <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">WE COLLECT</p>
              <p className="text-xs font-semibold text-on-dark-muted">11 DATA TYPES</p>
            </div>
            <ul className="divide-y divide-line">
              {collectRows.map((row) => (
                <li key={row.type} className="js-ledger-row px-5 py-4 hover:bg-surface sm:px-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[0.9375rem] font-semibold text-ink">{row.type}</p>
                    <span className="shrink-0 text-[0.75rem] font-semibold text-primary">
                      {row.retention}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{row.description}</p>
                  <p className="mt-1.5 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-muted">
                    {row.plans} plans
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-primary-soft px-5 py-3 sm:px-6">
              <p className="text-[0.8125rem] font-semibold text-primary">
                Retention capped at 24 months, automated deletion
              </p>
            </div>
            </TiltCard>
          </div>

          <div className="js-ledger-col [perspective:1400px]">
            <TiltCard
              maxAngle={2}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
            <div className="flex items-center justify-between bg-accent px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-white">WE NEVER COLLECT</p>
              <p className="text-xs font-semibold text-white/80">10 ARCHITECTURAL REFUSALS</p>
            </div>
            <ul className="divide-y divide-line">
              {neverRows.map((row) => (
                <li key={row.name} className="js-ledger-row flex items-start gap-3.5 px-5 py-4 hover:bg-surface sm:px-6">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                  >
                    <MinusIcon className="size-3" />
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-ink">{row.name}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{row.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-accent-soft px-5 py-3 sm:px-6">
              <p className="text-[0.8125rem] font-semibold text-accent">
                Not configuration options - constraints at every tier, now and in all future versions
              </p>
            </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
