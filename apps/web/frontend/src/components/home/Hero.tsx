"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";

const ledgerPreview = [
  {
    name: "ACTIVE",
    color: "oklch(0.706 0.118 161)",
    desc: "Using the workstation: keyboard or mouse input detected.",
    tag: "app · url",
  },
  {
    name: "PASSIVE",
    color: "oklch(0.55 0.11 225)",
    desc: "Engaged but not inputting: reading, training, meetings.",
    tag: "meeting",
  },
  {
    name: "IDLE",
    color: "oklch(0.49 0.03 160)",
    desc: "Away: no input beyond the 180-second threshold.",
    tag: "not scored",
  },
  {
    name: "PRIVATE_TIME",
    color: "oklch(0.62 0.12 82)",
    desc: "Capture paused by employee. Session duration only.",
    tag: "duration only",
  },
];

const headlineWords = "Workforce Analytics Built on Trust, Not Surveillance.".split(" ");

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const panelWrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
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
            q(".js-h-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.055, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-hero-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16)
          .fromTo(
            panel.current,
            { autoAlpha: 0, x: 72, scale: 0.94, rotationY: -10 },
            { autoAlpha: 1, x: 0, scale: 1, rotationY: 0, duration: 1.15 },
            0.55,
          );

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, autoAlpha: 0.7 },
            { scale: 3.4, autoAlpha: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 1.9 },
          );
        }

        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 };

        if (desktop) {
          // Depth stack, slowest → fastest:
          // 1) copy recedes up · 2) front layer: ledger panel pulls up fastest
          const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: scroll });
          tl.to(content.current, { y: -72, scale: 0.93, autoAlpha: 0 }, 0).to(panel.current, { y: -96 }, 0);

          // Pointer tilt on the ledger panel (front-layer depth)
          const xTo = gsap.quickTo(panel.current, "rotationY", { duration: 0.7, ease: "power3.out" });
          const yTo = gsap.quickTo(panel.current, "rotationX", { duration: 0.7, ease: "power3.out" });

          const onMove = (e: PointerEvent) => {
            const r = root.current!.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            xTo(nx * 7);
            yTo(-ny * 7);
          };
          const onLeave = () => {
            xTo(0);
            yTo(0);
          };
          root.current?.addEventListener("pointermove", onMove);
          root.current?.addEventListener("pointerleave", onLeave);

          const magneticCleanups = gsap.utils
            .toArray<HTMLElement>(".js-hero-cta", root.current!)
            .map((el) => attachMagnetic(el, 140, 0.4));

          return () => {
            root.current?.removeEventListener("pointermove", onMove);
            root.current?.removeEventListener("pointerleave", onLeave);
            magneticCleanups.forEach((fn) => fn());
          };
        }

        // Non-desktop: a gentler single-layer recede only.
        gsap.to(content.current, {
          y: -56,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div
        ref={content}
        className="container-x relative grid items-center gap-16 pb-20 pt-32 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-28 lg:pt-44"
      >
        <div>
          <p
            ref={badge}
            className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
          >
            Employee-visible monitoring · No stealth mode
          </p>
          <h1 className="mt-7 font-display text-[clamp(2.75rem,4vw+2rem,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                  <span className="js-h-word inline-block will-change-transform">{word}</span>
                </span>
                {i < headlineWords.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p ref={lede} className="mt-7 max-w-xl text-lg leading-relaxed text-hero-muted">
            Workforce analytics for small-to-medium businesses with remote and hybrid teams. Get
            verifiable productivity data your employees can see in real time, without surveillance,
            keystroke logging, or stealth mode.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/early-access" className="btn btn-lg btn-primary js-hero-cta">
              Get Early Access
            </Link>
            <Link href="/pricing" className="btn btn-lg btn-outline-hero js-hero-cta">
              See Pricing
            </Link>
          </div>
          <p ref={note} className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted">
            <span>Early access</span>
            <span className="text-hero-line" aria-hidden="true">
              ·
            </span>
            <span>14-day free trial</span>
            <span className="text-hero-line" aria-hidden="true">
              ·
            </span>
            <span>No credit card</span>
            <span className="text-hero-line" aria-hidden="true">
              ·
            </span>
            <span>No seat minimum</span>
          </p>
        </div>
        <div className="lg:justify-self-end">
          <div ref={panelWrap} className="relative [perspective:1400px]">
            <div
              ref={panel}
              className="hero-panel relative w-full max-w-[30rem] [transform-style:preserve-3d] lg:max-w-[32rem]"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl border border-hero-line/70 [transform:translateZ(-28px)]"
              />
              <div className="relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(16px)]">
                <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                  <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                    OPEN LEDGER
                  </p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-on-dark-muted">
                    <span className="relative inline-flex size-1.5">
                      <span className="absolute inset-0 rounded-full bg-state-active" />
                      <span
                        ref={ping}
                        className="absolute inset-0 rounded-full border border-state-active"
                      />
                    </span>
                    LIVE · HEARTBEAT 60s
                  </p>
                </div>
                <ul className="divide-y divide-line bg-white">
                  {ledgerPreview.map((s) => (
                    <li key={s.name} className="flex items-center gap-4 px-5 py-3.5">
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold tracking-[0.14em] text-ink">{s.name}</p>
                        <p className="mt-0.5 text-xs leading-snug text-muted">{s.desc}</p>
                      </div>
                      <span
                        className={
                          s.name === "PRIVATE_TIME"
                            ? "shrink-0 rounded-full border border-line bg-primary-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-primary"
                            : "shrink-0 rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-semibold text-muted"
                        }
                      >
                        {s.tag}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between bg-primary-soft px-5 py-3">
                  <p className="text-[0.6875rem] font-semibold text-primary">Signed · server-verified</p>
                  <p className="text-[0.6875rem] font-semibold text-primary">
                    No data hidden from employees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
