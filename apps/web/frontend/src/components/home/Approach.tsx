"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { TiltCard } from "@/components/common/TiltCard";

const collects = ["Application names", "Window titles", "URL domains"];
const never = [
  "Keystrokes",
  "Audio or video",
  "Webcam or microphone",
  "Continuous screen recording",
  "Emotion or biometric inference",
];
const visible = [
  "The Agent sits visibly in every system tray with a live capture indicator. Nothing runs in secret.",
  "Employees see the same real-time data their manager sees, so trust replaces resentment.",
  "A complete access log tells each employee who viewed their data, and when.",
];

export function Approach() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = ctx.conditions?.desktop;

        // Ledger stroke-draw prep - icons start as an invisible "trace" that writes itself in.
        q(".js-draw").forEach((path) => {
          const len = (path as unknown as SVGPathElement).getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-approach-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-approach-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-approach-item"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09 },
            "-=0.25",
          )
          .fromTo(
            q(".js-capture-card"),
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            "-=0.5",
          )
          .fromTo(
            q(".js-capture-group"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 },
            "-=0.45",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut", stagger: 0.06 }, "-=0.3")
          .fromTo(
            q(".js-approach-divider-line"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.6, ease: EASE },
            "-=0.4",
          );

        if (desktop) {
          // Subtle scroll-scrub drift - ties the card into the page's depth, not bolted on top.
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
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-y border-line bg-surface py-section">
      <div className="container-x grid gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="js-approach-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Collect Less, Show More.
          </h2>
          <p className="js-approach-lead mt-6 text-lg leading-relaxed text-muted">
            Veracity works the opposite way from traditional monitoring tools. We collect only what
            meaningful productivity analytics require, we show every employee exactly what we know
            about them, and we never operate in secret. No stealth mode, no hidden capture, no data
            collected without an employee&apos;s knowledge.
          </p>
          <ul className="mt-10 space-y-5">
            {visible.map((item) => (
              <li key={item} className="js-approach-item flex items-start gap-3 text-[0.9375rem] leading-relaxed">
                <CheckIcon pathClassName="js-draw" className="mt-1 size-4 shrink-0 text-pine" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.9375rem] leading-relaxed text-muted">
            <Link
              href="/compliance"
              className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
            >
              Read the full compliance and security architecture
            </Link>
            , including data retention and the jurisdiction-aware notice engine.
          </p>
        </div>
        <div>
          <div
            ref={card}
            className="js-capture-card [perspective:1400px]"
          >
            <TiltCard
              maxAngle={1.5}
              className="rounded-3xl border border-line bg-bg p-7 sm:p-9"
            >
            <div className="js-capture-group">
                <h3 className="font-display text-xl font-semibold">What Veracity captures</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  Activity data at sixty-second heartbeat intervals: enough to understand work
                  patterns, not enough to invade privacy.
                </p>
                <ul className="mt-5 space-y-3">
                  {collects.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[0.9375rem]">
                      <CheckIcon pathClassName="js-draw" className="size-4 shrink-0 text-pine" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-[0.9375rem] leading-relaxed text-ink">
                  Screenshot capture: optional on Growth and Enterprise, at fixed intervals with
                  client-side redaction.
                </p>
              </div>
              <div className="js-approach-divider my-9 h-px overflow-hidden" aria-hidden="true">
                <div className="js-approach-divider-line h-full w-full origin-left bg-line" />
              </div>
              <div className="js-capture-group">
                <h3 className="font-display text-xl font-semibold">What Veracity never captures</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  A deliberate architectural constraint at every tier, now and in all future
                  versions.
                </p>
                <ul className="mt-5 space-y-3">
                  {never.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[0.9375rem]">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <MinusIcon pathClassName="js-draw" className="size-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
