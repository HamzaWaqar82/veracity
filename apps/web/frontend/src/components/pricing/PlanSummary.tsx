"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";
import { CheckIcon } from "@/components/icons";
import { TiltCard } from "@/components/common/TiltCard";
import { tiers, type Tier } from "./pricing-data";
import { CTA } from "@/lib/cta";

function PriceBlock({ tier, annual }: { tier: Tier; annual: boolean }) {
  const display = annual ? tier.annual : tier.monthly;
  const [shown, setShown] = useState(display);
  const lastRef = useRef(display);
  const capRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = !window.matchMedia(MOTION).matches;
    const target = Number(display.slice(1));
    const from = Number(lastRef.current.slice(1));
    lastRef.current = display;

    if (reduce || from === target) {
      setShown(display);
      return;
    }

    const proxy = { v: from };
    const tween = gsap.to(proxy, {
      v: target,
      duration: 0.35,
      ease: EASE,
      onUpdate: () => setShown(`$${Math.round(proxy.v)}`),
    });
    if (capRef.current) {
      gsap.fromTo(
        capRef.current,
        { autoAlpha: 0, y: 4 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: EASE },
      );
    }
    return () => {
      tween.kill();
    };
  }, [display]);

  return (
    <div className="relative mt-5 h-24">
      <div aria-hidden="true">
        <span className="font-sans text-5xl font-bold tabular-nums tracking-tight text-primary">
          {shown}
        </span>
        <span className="ml-1 text-sm font-medium text-muted">/ user / month</span>
        <span ref={capRef} className="mt-1 block text-[0.8125rem] font-medium text-muted">
          {annual ? `${tier.year} / user / year · two months free` : "billed monthly"}
        </span>
      </div>
      <span className="sr-only" aria-live="polite">
        {display} per user per month
        {annual ? `, billed ${tier.year} per user per year` : ", billed monthly"}
      </span>
    </div>
  );
}

export function PlanSummary() {
  const root = useRef<HTMLElement>(null);
  const [annual, setAnnual] = useState(false);

  const groupRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const monthlyBtnRef = useRef<HTMLButtonElement>(null);
  const annualBtnRef = useRef<HTMLButtonElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const prevAnnual = useRef(annual);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        tl.fromTo(
          q(".js-plan-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-plan-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-plan-panel"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            "-=0.25",
          );
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const cleanups = gsap.utils
          .toArray<HTMLElement>(".js-plan-cta", root.current!)
          .map((el) => attachMagnetic(el, 140, 0.4));
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  const positionThumb = () => {
    const container = groupRef.current;
    const active = annual ? annualBtnRef.current : monthlyBtnRef.current;
    const thumb = thumbRef.current;
    if (!container || !active || !thumb) return;
    const cr = container.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const x = ar.left - cr.left;
    const w = ar.width;
    if (window.matchMedia(MOTION).matches) {
      gsap.to(thumb, { left: x, width: w, duration: 0.28, ease: EASE, overwrite: true });
    } else {
      gsap.set(thumb, { left: x, width: w });
    }
  };

  useLayoutEffect(() => {
    positionThumb();
    const onResize = () => positionThumb();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annual]);

  useEffect(() => {
    if (annual && !prevAnnual.current && chipRef.current && window.matchMedia(MOTION).matches) {
      gsap.fromTo(
        chipRef.current,
        { scale: 0.65, autoAlpha: 0.5 },
        { scale: 1, autoAlpha: 1, duration: 0.4, ease: EASE, overwrite: true },
      );
    }
    prevAnnual.current = annual;
  }, [annual]);

  return (
    <section ref={root} id="plan-details" className="scroll-mt-28 py-section">
      <div className="container-x">
        <h2 className="js-plan-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Three plans, one published matrix.
        </h2>
        <p className="js-plan-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The same trust-preserving defaults ship at every tier - no stealth mode, no keystroke
          logging, ever. Choose by team size, support, and how deep the visibility needs to go.
        </p>

        <div className="js-plan-panel mt-12 rounded-2xl border border-line bg-bg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
            <p className="text-[0.9375rem] leading-relaxed text-muted">
              Billed per active user per month.
            </p>
            <div
              ref={groupRef}
              role="group"
              aria-label="Billing period"
              className="relative inline-flex items-center rounded-full border border-line bg-surface p-1"
            >
              <span
                ref={thumbRef}
                aria-hidden="true"
                className="absolute inset-y-1 rounded-full bg-bg shadow-sm"
                style={{ left: 4, width: 80 }}
              />
              <button
                ref={monthlyBtnRef}
                type="button"
                aria-pressed={!annual}
                onClick={() => setAnnual(false)}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  !annual ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                ref={annualBtnRef}
                type="button"
                aria-pressed={annual}
                onClick={() => setAnnual(true)}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  annual ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                Annual
                <span
                  ref={chipRef}
                  className="ml-1.5 inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[0.8125rem] font-semibold text-primary"
                >
                  2 months free
                </span>
              </button>
            </div>
          </div>

          <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                id={tier.id}
                className="scroll-mt-28 [perspective:1400px]"
              >
                <TiltCard maxAngle={1.5} className="h-full px-6 py-8 sm:px-8">
                <h3 className="font-display text-2xl font-semibold">{tier.name}</h3>
                <PriceBlock tier={tier} annual={annual} />
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{tier.pitch}</p>

                <dl className="mt-7 space-y-3 border-t border-line pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Users
                    </dt>
                    <dd className="text-sm font-medium text-ink">{tier.users}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Support
                    </dt>
                    <dd className="text-right text-sm leading-snug text-muted">{tier.support}</dd>
                  </div>
                </dl>

                <p className="mt-6 flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-muted">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {tier.highlight}
                </p>

                <Link href={CTA.trial} className="btn btn-outline js-plan-cta mt-8 w-full">
                  Start Free Trial
                </Link>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>

        <p className="js-plan-panel mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          Every tier includes the same trust stack: the 60s heartbeat, published productivity
          scoring, the employee dashboard, Private Time, and the AES-256 offline cache. Visual
          monitoring is optional - Starter has none.
        </p>
      </div>
    </section>
  );
}
