"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { MinusIcon } from "@/components/icons";

const formulaLines = [
  "score = round(",
  "    ( productive_ms + 0.5 × passive_ms )",
  "    ÷ ( productive_ms + neutral_ms + unproductive_ms + 0.5 × passive_ms )",
  "    × 100",
  ")",
];

const legend = [
  { label: "productive", weight: "Full weight", color: "oklch(0.706 0.118 161)" },
  { label: "passive", weight: "Half weight", color: "oklch(0.55 0.11 225)" },
  { label: "neutral", weight: "Full weight", color: "oklch(0.45 0.018 165)" },
  { label: "unproductive", weight: "Full weight", color: "oklch(0.66 0.15 60)" },
  { label: "idle", weight: "Excluded · never penalized", color: "oklch(0.49 0.03 160)" },
  { label: "private time", weight: "Excluded entirely", color: "oklch(0.62 0.12 82)" },
];

export function Methodology() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

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
          q(".js-method-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-method-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-method-link"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.35",
          )
          .fromTo(
            card.current,
            { autoAlpha: 0, y: 34, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.95 },
            "-=0.5",
          )
          .fromTo(
            q(".js-method-row"),
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 },
            "-=0.55",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <h2 className="js-method-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            The score is published, not guessed.
          </h2>
          <p className="js-method-lead mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Veracity&apos;s daily 0–100 productivity score comes from one published formula,
            calculated at midnight local time and visible to every employee. The inputs are the same
            activity data the employee can see; the methodology version is stored with every score
            for audit traceability.
          </p>
          <p className="js-method-link mt-8 text-[0.9375rem] leading-relaxed text-muted">
            <Link
              href="/blog/how-productivity-scoring-works"
              className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
            >
              How productivity scoring works
            </Link>{" "}
            — the full write-up of why the formula looks like this.
          </p>
        </div>

        <div className="relative [perspective:1400px]">
          <div
            ref={card}
            className="js-method-card relative mx-auto w-full max-w-[34rem] [transform-style:preserve-3d]"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl border border-hero-line/60 [transform:translateZ(-24px)]"
            />
            <div className="relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(14px)]">
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">PUBLISHED METHODOLOGY</p>
                <p className="text-xs font-semibold text-on-dark-muted">VER 1.0</p>
              </div>

              <div className="bg-white px-5 py-6 sm:px-7">
                <div className="rounded-xl bg-surface px-5 py-5 font-sans text-[0.9375rem] font-semibold leading-relaxed text-ink tabular-nums sm:text-base">
                  {formulaLines.map((line, i) => (
                    <div
                      key={i}
                      className="js-method-row"
                    >
                      {i === 0 ? (
                        <>
                          <span className="text-primary">score</span> = round(
                        </>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>

                <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5">
                  {legend.map((item) => (
                    <li key={item.label} className="js-method-row flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">{item.label}</span>
                        <span className="block text-[0.8125rem] leading-snug text-muted">{item.weight}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="js-method-row mt-6 flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-accent">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                    <MinusIcon className="size-3" />
                  </span>
                  No accuracy-percentage claims, anywhere. The published methodology is the only
                  accuracy representation.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-primary-soft px-5 py-3">
                <p className="text-[0.6875rem] font-semibold text-primary">Methodology v1.0 · stored with every score</p>
                <p className="text-[0.6875rem] font-semibold text-primary">Auditable end to end</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
