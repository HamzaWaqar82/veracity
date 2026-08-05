"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";
import { CTA } from "@/lib/cta";

const headlineWords = "Pricing that states its own terms.".split(" ");

const jumpLinks = [
  { label: "Plans", href: "#plans" },
  { label: "Billing", href: "#billing" },
  { label: "What we never do", href: "#never" },
];

const receiptRows = [
  { label: "Growth · annual billing", value: "$10 / user / month" },
  { label: "Billed once per year", value: "$120 / user" },
  { label: "Two months free", value: "Applied" },
  { label: "No seat minimum · no setup fee", value: "Confirmed" },
];

export function PricingHero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const receipt = useRef<HTMLDivElement>(null);
  const receiptWrap = useRef<HTMLDivElement>(null);
  const ping = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = ctx.conditions?.desktop;

        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-price-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-price-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16)
          .fromTo(jump.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 1.26)
          .fromTo(
            receipt.current,
            { autoAlpha: 0, y: 56, rotationX: -8, transformOrigin: "50% 0%" },
            { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.05 },
            0.72,
          )
          .fromTo(
            q(".js-price-receipt-row"),
            { autoAlpha: 0, y: -6, clipPath: "inset(0 0 100% 0)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.45, stagger: 0.09 },
            1.4,
          )
          .fromTo(
            q(".js-price-receipt-foot"),
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
            1.85,
          );

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, autoAlpha: 0.7 },
            { scale: 3.2, autoAlpha: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 2.2 },
          );
        }

        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 };

        if (desktop) {
          // Depth stack, slowest → fastest: copy recedes · receipt pulls up fastest
          const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: scroll });
          tl.to(content.current, { y: -72, scale: 0.93, autoAlpha: 0 }, 0)
            .to(receipt.current, { y: -56, scale: 0.97 }, 0)
            .to(receiptWrap.current, { y: -64 }, 0);
        } else {
          gsap.to(content.current, {
            y: -56,
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: scroll,
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div
        ref={content}
        className="container-x relative pb-28 pt-32 text-center sm:pt-40 lg:pb-36 lg:pt-44"
      >
        <p
          ref={badge}
          className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
        >
          Published pricing · No hidden fees
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headlineWords.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                <span className="js-price-word inline-block will-change-transform">{word}</span>
              </span>
              {i < headlineWords.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p ref={lede} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
          Three plans, one published matrix. Every price, limit, and support commitment is stated
          here in exact numbers — and what no plan includes is stated just as plainly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={CTA.trial} className="btn btn-lg btn-primary js-price-cta">
            Start Free Trial
          </Link>
          <a
            href="mailto:sales@veracity.dev?subject=Veracity%20pricing"
            className="btn btn-lg btn-outline-hero js-price-cta"
          >
            Contact Sales
          </a>
        </div>
        <p ref={note} className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted">
          <span>14-day free trial</span>
          <span className="text-hero-line" aria-hidden="true">·</span>
          <span>No credit card</span>
          <span className="text-hero-line" aria-hidden="true">·</span>
          <span>No seat minimum</span>
        </p>
        <div ref={jump} className="mt-14">
          <SectionJumpNav ariaLabel="Pricing sections" links={jumpLinks} />
        </div>

        <div ref={receiptWrap} className="mt-16 [perspective:1400px]">
          <div
            ref={receipt}
            className="js-price-receipt relative mx-auto w-full max-w-[26rem] text-left [transform-style:preserve-3d]"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl border border-hero-line/70 [transform:translateZ(-24px)]"
            />
            <div className="relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(12px)]">
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                  PRICE QUOTE · ANNUAL
                </p>
                <p className="flex items-center gap-2 text-xs font-semibold text-on-dark-muted">
                  <span className="relative inline-flex size-1.5">
                    <span className="absolute inset-0 rounded-full bg-state-active" />
                    <span
                      ref={ping}
                      className="absolute inset-0 rounded-full border border-state-active"
                    />
                  </span>
                  FIXED · 2 MOS FREE
                </p>
              </div>
              <ul className="divide-y divide-line bg-white">
                {receiptRows.map((row) => (
                  <li
                    key={row.label}
                    className="js-price-receipt-row flex items-baseline justify-between gap-6 px-5 py-3"
                  >
                    <span className="text-sm font-medium text-hero-muted">{row.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-hero-ink">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="js-price-receipt-foot flex items-center justify-between bg-primary-soft px-5 py-3">
                <p className="text-[0.6875rem] font-semibold text-primary">Signed · published terms</p>
                <p className="text-[0.6875rem] font-semibold text-primary">No hidden fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
