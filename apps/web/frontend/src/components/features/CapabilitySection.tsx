"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { MinusIcon } from "@/components/icons";
import { TiltCard } from "@/components/common/TiltCard";
import { tierLabel, type Capability } from "./features-data";

export function CapabilitySection({ capability }: { capability: Capability }) {
  const root = useRef<HTMLElement>(null);
  const isGrid = capability.id === "understand";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        q(".js-draw").forEach((path) => {
          const len = (path as unknown as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

        const draws = q(".js-draw");

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-cap-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-cap-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          );

        const wrap = root.current?.querySelector<HTMLElement>(".js-cap-wrap");
        if (!wrap) return;
        const items = gsap.utils.toArray<HTMLElement>(".js-cap-entry", wrap);
        if (!items.length) return;

        if (isGrid) {
          const scrubTl = gsap.timeline({
            scrollTrigger: { trigger: wrap, start: "top 84%", end: "top 34%", scrub: 0.8 },
          });
          scrubTl.fromTo(items, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "none", stagger: 0.11 });
          if (draws.length) {
            scrubTl.to(draws, { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, "-=0.3");
          }
        } else {
          const dividers = gsap.utils.toArray<HTMLElement>(".js-cap-divider > div", wrap);
          const entriesTl = gsap.timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: wrap, start: "top 82%" },
          });
          entriesTl
            .fromTo(items, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 }, 0.1)
            .fromTo(dividers, { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.06 }, "-=0.4");
          if (draws.length) {
            entriesTl.to(
              draws,
              { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut", stagger: 0.06 },
              "-=0.45",
            );
          }
        }
      });
    },
    { scope: root },
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION }, () => {
      gsap.fromTo(
        el,
        { backgroundColor: "oklch(0.938 0.042 150 / 0.85)" },
        { backgroundColor: "oklch(0.938 0.042 150 / 0)", duration: 2.4, ease: "power2.out", delay: 0.5 },
      );
    });
    return () => mm.revert();
  }, []);

  const band = isGrid ? "py-section" : "border-y border-line bg-surface py-section";

  return (
    <section ref={root} className={band}>
      <div className="container-x">
        <h2
          id={capability.id}
          className="js-cap-h scroll-mt-28 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
        >
          {capability.name}
        </h2>
        <p className="js-cap-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {capability.lead}
        </p>

        {isGrid ? (
          <div className="js-cap-wrap mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {capability.entries.map((entry) => (
              <article
                key={entry.id}
                id={entry.id}
                className="js-cap-entry scroll-mt-24 [perspective:1400px]"
              >
                <TiltCard maxAngle={1.5} className="h-full bg-bg p-7 sm:p-9">
                  <FeatureEntryBody entry={entry} />
                </TiltCard>
              </article>
            ))}
          </div>
        ) : (
          <div className="js-cap-wrap js-cap-ledger mt-12 [perspective:1400px]">
            <TiltCard maxAngle={1.5} className="overflow-hidden rounded-2xl border border-line bg-bg">
            {capability.entries.map((entry, i) => (
              <Fragment key={entry.id}>
                {i > 0 && (
                  <div className="js-cap-divider h-px overflow-hidden" aria-hidden="true">
                    <div className="h-full w-full origin-left bg-line" />
                  </div>
                )}
                <article id={entry.id} className="js-cap-entry scroll-mt-24 px-6 py-7 sm:px-9 sm:py-8">
                  <FeatureEntryBody entry={entry} />
                </article>
              </Fragment>
            ))}
            </TiltCard>
          </div>
        )}
      </div>
    </section>
  );
}

function FeatureEntryBody({ entry }: { entry: Capability["entries"][number] }) {
  return (
    <>
      <header className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="js-cap-dot size-2.5 shrink-0 rounded-full bg-pine" />
        <h3 className="font-display text-xl font-semibold">{entry.name}</h3>
        <span
          className={
            entry.tier === "enterprise"
              ? "ml-auto shrink-0 rounded-full bg-primary-deep px-3 py-1 text-[0.6875rem] font-semibold text-on-dark"
              : "ml-auto shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[0.6875rem] font-semibold text-primary"
          }
        >
          {tierLabel[entry.tier]}
        </span>
      </header>
      <p className="mt-3.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted">{entry.desc}</p>
      {entry.refusal && (
        <p className="mt-4 flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-accent">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
            <MinusIcon pathClassName="js-draw" className="size-3" />
          </span>
          {entry.refusal}
        </p>
      )}
      <ul className="mt-5 flex flex-wrap gap-2">
        {entry.specs.map((spec) => (
          <li
            key={spec}
            className="rounded-full border border-line bg-surface px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink"
          >
            {spec}
          </li>
        ))}
      </ul>
    </>
  );
}
