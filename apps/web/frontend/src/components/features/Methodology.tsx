"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, DESKTOP, HOVER } from "@/lib/motion";
import { attachSpotlight, attachTilt } from "@/lib/cursor";
import { MinusIcon } from "@/components/icons";
import { computeScore, exampleDays } from "./features-data";

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
  { label: "unproductive", weight: "Full weight", color: "oklch(0.56 0.145 42)" },
  { label: "idle", weight: "Excluded · never penalized", color: "oklch(0.49 0.03 160)" },
  { label: "private time", weight: "Excluded entirely", color: "oklch(0.62 0.12 82)" },
];

const ledgerRows: {
  key: "productive" | "passive" | "neutral" | "unproductive" | "idle" | "privateTime";
  label: string;
  color: string;
  excluded?: boolean;
}[] = [
  { key: "productive", label: "productive", color: "oklch(0.706 0.118 161)" },
  { key: "passive", label: "passive", color: "oklch(0.55 0.11 225)" },
  { key: "neutral", label: "neutral", color: "oklch(0.45 0.018 165)" },
  { key: "unproductive", label: "unproductive", color: "oklch(0.56 0.145 42)" },
  { key: "idle", label: "idle", color: "oklch(0.49 0.03 160)", excluded: true },
  { key: "privateTime", label: "private time", color: "oklch(0.62 0.12 82)", excluded: true },
];

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Methodology() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const cardSpot = useRef<HTMLDivElement>(null);
  const ping = useRef<HTMLSpanElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const bandSpot = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const spinRef = useRef<HTMLSpanElement>(null);

  const [index, setIndex] = useState(0);
  const prevScore = useRef<number | null>(null);
  const [announce, setAnnounce] = useState("");

  const day = exampleDays[index];
  const { numerator, denominator, score } = computeScore(day);
  const totalMinutes =
    day.productive + day.passive + day.neutral + day.unproductive + day.idle + day.privateTime;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        q(".js-method-draw").forEach((path) => {
          const len = (path as unknown as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

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
          )
          .to(
            q(".js-method-draw"),
            { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" },
            "-=0.3",
          );

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, autoAlpha: 0.7 },
            { scale: 3.4, autoAlpha: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 1.9 },
          );
        }

        if (band.current) {
          const rows = gsap.utils.toArray<HTMLElement>(".js-ledger-row", band.current);
          const ledgerTl = gsap.timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: band.current, start: "top 85%" },
          });
          ledgerTl
            .fromTo(band.current, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.85 })
            .fromTo(
              rows,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.045 },
              "-=0.5",
            );
        }
      });

      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.desktop) return;
        if (!card.current) return;
        gsap.fromTo(
          card.current,
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const cleanups: (() => void)[] = [];
        if (inner.current) cleanups.push(attachTilt(inner.current, 1.5));
        if (cardSpot.current) cleanups.push(attachSpotlight(cardSpot.current));
        if (bandSpot.current) cleanups.push(attachSpotlight(bandSpot.current));
        if (band.current) cleanups.push(attachTilt(band.current, 1.5));
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  useLayoutEffect(() => {
    const target = scoreRef.current;
    if (!target) return;
    const to = score ?? 0;
    const from = prevScore.current ?? to;
    prevScore.current = to;
    if (!window.matchMedia(MOTION).matches) {
      target.textContent = String(to);
      return;
    }
    target.textContent = String(from);
    const obj = { v: from };
    const tween = gsap.to(obj, {
      v: to,
      duration: 0.9,
      ease: EASE,
      onUpdate: () => {
        target.textContent = String(Math.round(obj.v));
      },
    });
    return () => {
      tween.kill();
    };
  }, [index, score]);

  const reroll = () => {
    setIndex((i) => (i + 1) % exampleDays.length);
    const nextDay = exampleDays[(index + 1) % exampleDays.length];
    const next = computeScore(nextDay);
    setAnnounce(
      `${nextDay.label}, daily score ${next.score ?? "not computed"}.`,
    );
    const motionOK = window.matchMedia(MOTION).matches;
    if (!band.current || !motionOK) return;
    const rows = gsap.utils.toArray<HTMLElement>(".js-ledger-row", band.current);
    if (rows.length) {
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE, stagger: 0.045, overwrite: "auto" },
      );
    }
    if (spinRef.current) {
      gsap.fromTo(spinRef.current, { rotate: 0 }, { rotate: 360, duration: 0.7, ease: "power3.out" });
    }
  };

  return (
    <section ref={root} className="py-section">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="min-w-0">
          <h2 className="js-method-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            The score is published, not guessed.
          </h2>
          <p className="js-method-lead mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Veracity&apos;s daily 0-100 productivity score comes from one published formula,
            calculated at midnight local time and visible to every employee. The inputs are the same
            activity data the employee can see; the methodology version is stored with every score
            for audit traceability.
          </p>
          <p className="js-method-link mt-8 text-[0.9375rem] leading-relaxed text-muted">
            <Link
              href="/resources/how-productivity-scoring-works"
              className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
            >
              How productivity scoring works
            </Link>{" "} - the full write-up of why the formula looks like this.
          </p>
        </div>

        <div className="relative min-w-0 [perspective:1400px]">
          <div
            ref={card}
            className="js-method-card relative mx-auto w-full max-w-[34rem] [transform-style:preserve-3d]"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl border border-hero-line/60 [transform:translateZ(-24px)]"
            />
            <div
              ref={inner}
              className="js-method-inner relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(14px)]"
            >
              <div
                ref={cardSpot}
                aria-hidden="true"
                className="approach-spotlight pointer-events-none absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: "42rem",
                  height: "42rem",
                  marginLeft: "-21rem",
                  marginTop: "-21rem",
                }}
              />
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">PUBLISHED METHODOLOGY</p>
                <p className="text-xs font-semibold text-on-dark-muted">VER 1.0</p>
              </div>

              <div className="bg-white px-5 py-6 sm:px-7">
                <div className="overflow-x-auto whitespace-nowrap rounded-xl bg-surface px-5 py-5 font-sans text-[0.9375rem] font-semibold leading-relaxed text-ink tabular-nums sm:text-base">
                  {formulaLines.map((line, i) => (
                    <div key={i} className="js-method-row">
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
                    <MinusIcon pathClassName="js-method-draw" className="size-3" />
                  </span>
                  No accuracy-percentage claims, anywhere. The published methodology is the only
                  accuracy representation.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-primary-soft px-5 py-3">
                <p className="text-[0.8125rem] font-semibold text-primary">Methodology v1.0 · stored with every score</p>
                <p className="text-[0.8125rem] font-semibold text-primary">Auditable end to end</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x mt-14 lg:mt-20">
        <div
          ref={band}
          className="js-ledger-wrap relative overflow-hidden rounded-2xl border border-line bg-bg"
        >
          <div
            ref={bandSpot}
            aria-hidden="true"
            className="approach-spotlight pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "42rem",
              height: "42rem",
              marginLeft: "-21rem",
              marginTop: "-21rem",
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-primary-deep px-5 py-3.5">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-on-dark">
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-state-active" />
                <span ref={ping} className="absolute inset-0 rounded-full border border-state-active" />
              </span>
              LIVE WORKED EXAMPLE
            </p>
            <button
              type="button"
              onClick={reroll}
              aria-label="Re-roll to a different example day"
              className="inline-flex items-center gap-2 rounded-full border border-on-dark-line px-3.5 py-1.5 text-xs font-semibold text-on-dark transition-colors duration-200 hover:bg-white/10"
            >
              <span ref={spinRef} className="inline-flex">
                <RefreshIcon className="size-3.5" />
              </span>
              Re-roll example
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="js-ledger-row font-display text-xl font-semibold">{day.label}</h3>
                <p className="js-ledger-row text-xs font-semibold tabular-nums text-muted">
                  {totalMinutes / 60} hours captured
                </p>
              </div>
              <p className="js-ledger-row mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{day.note}</p>
              <ul className="mt-5 space-y-3.5">
                {ledgerRows.map((row) => {
                  const mins = day[row.key];
                  return (
                    <li key={row.key} className="js-ledger-row">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          {row.label}
                        </span>
                        {row.excluded ? (
                          <span className="rounded-full border border-line px-2 py-0.5 text-[0.8125rem] font-semibold text-muted">
                            EXCLUDED
                          </span>
                        ) : (
                          <span className="text-[0.9375rem] font-semibold tabular-nums text-ink">{mins}m</span>
                        )}
                      </div>
                      {!row.excluded && (
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-deep">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(3, (mins / totalMinutes) * 100)}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="js-ledger-row mt-5 text-xs font-medium text-muted">
                {day.productive + day.passive + day.neutral + day.unproductive} scored minutes · idle
                and private time never enter the formula
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <p className="js-ledger-row text-xs font-bold tracking-[0.16em] text-muted">
                COMPUTED FROM THE PUBLISHED FORMULA
              </p>
              <dl className="js-ledger-row mt-4 space-y-2.5 text-[0.9375rem] leading-relaxed">
                <div className="flex items-baseline justify-between gap-x-4 rounded-lg bg-surface px-4 py-2.5">
                  <dt className="shrink-0 font-semibold text-ink">numerator</dt>
                  <dd className="text-right tabular-nums text-muted">
                    {day.productive} + 0.5 × {day.passive} ={" "}
                    <span className="font-semibold text-ink">{numerator}</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-x-4 rounded-lg bg-surface px-4 py-2.5">
                  <dt className="shrink-0 font-semibold text-ink">denominator</dt>
                  <dd className="text-right tabular-nums text-muted">
                    {day.productive} + {day.neutral} + {day.unproductive} + 0.5 × {day.passive} ={" "}
                    <span className="font-semibold text-ink">{denominator}</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-x-4 rounded-lg bg-surface px-4 py-2.5">
                  <dt className="shrink-0 font-semibold text-ink">score</dt>
                  <dd className="text-right tabular-nums text-muted">
                    round({numerator} ÷ {denominator} × 100) ={" "}
                    <span className="font-semibold text-ink">{score ?? " - "}</span>
                  </dd>
                </div>
              </dl>
              <div className="js-ledger-row mt-5 flex items-center justify-between gap-4 rounded-xl bg-primary-soft px-5 py-4">
                <div>
                  <p className="text-[0.8125rem] font-bold tracking-[0.16em] text-primary">
                    DAILY SCORE · 0-100
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary">Recomputed from the rows you see</p>
                </div>
                <p className="font-display text-5xl font-semibold leading-none text-primary">
                  <span ref={scoreRef}>{score ?? " - "}</span>
                </p>
                <p className="sr-only" aria-live="polite">
                  {announce}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-primary-soft px-5 py-3">
            <p className="text-[0.8125rem] font-semibold text-primary">
              Every score recomputes from the displayed minutes via the published formula above.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
