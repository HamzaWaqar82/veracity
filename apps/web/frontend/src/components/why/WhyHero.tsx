"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { CTA } from "@/lib/cta";

const headlineWords = "The monitoring market offers a false choice.".split(" ");

const jumpLinks = [
  { label: "Comparison", href: "#comparison-with-traditional-monitoring-tools" },
  { label: "Difference", href: "#the-veracity-difference-in-practice" },
  { label: "ROI", href: "#the-roi-of-transparent-monitoring" },
  { label: "Right fit", href: "#when-veracity-is-not-the-right-fit" },
  { label: "Customers", href: "#what-customers-say" },
];

const stubRows = [
  {
    name: "Always-visible agent",
    desc: "Identifiable icon, live capture status",
    tag: "capture-affirming",
    voice: "affirms",
  },
  {
    name: "No keystroke logging",
    desc: "Architectural constraint at all tiers",
    tag: "never",
    voice: "refuses",
  },
];

export function WhyHero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const stub = useRef<HTMLDivElement>(null);
  const ping = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = !!ctx.conditions?.desktop;

        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-why-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-why-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16)
          .fromTo(
            stub.current,
            { autoAlpha: 0, y: 40, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 },
            0.9,
          )
          .fromTo(jump.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 1.4);

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, autoAlpha: 0.7 },
            { scale: 3.4, autoAlpha: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 2.2 },
          );
        }

        const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 };

        if (desktop) {
          // Depth stack — copy recedes up, front layer (ledger stub) pulls up fastest.
          const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: scroll });
          tl.to(content.current, { y: -72, scale: 0.93, autoAlpha: 0 }, 0).to(stub.current, { y: -96 }, 0);

          // Pointer tilt on the ledger stub (front-layer depth)
          const xTo = gsap.quickTo(stub.current, "rotationY", { duration: 0.7, ease: "power3.out" });
          const yTo = gsap.quickTo(stub.current, "rotationX", { duration: 0.7, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const r = root.current!.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            xTo(nx * 6);
            yTo(-ny * 6);
          };
          const onLeave = () => {
            xTo(0);
            yTo(0);
          };
          root.current?.addEventListener("pointermove", onMove);
          root.current?.addEventListener("pointerleave", onLeave);

          const magneticCleanups = gsap.utils
            .toArray<HTMLElement>(".js-why-cta", root.current!)
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
          scrollTrigger: scroll,
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div ref={content} className="container-x relative pt-32 text-center sm:pt-40 lg:pt-44">
        <p
          ref={badge}
          className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
        >
          The transparent alternative to employee surveillance
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headlineWords.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                <span className="js-why-word inline-block will-change-transform">{word}</span>
              </span>
              {i < headlineWords.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p ref={lede} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
          Traditional monitoring tools offer a false choice: accept zero visibility into how your
          team works, or deploy surveillance that destroys trust. Veracity rejects the framing — and
          this page shows you exactly how.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={CTA.trial} className="btn btn-lg btn-primary js-why-cta">
            Start Free Trial
          </Link>
          <Link href="/pricing" className="btn btn-lg btn-outline-hero js-why-cta">
            Compare plans
          </Link>
        </div>
        <p
          ref={note}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted"
        >
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

        <div className="relative mx-auto mt-12 w-full max-w-[30rem] [perspective:1400px] lg:max-w-[32rem]">
          <div ref={stub} className="js-why-stub relative w-full text-left [transform-style:preserve-3d]">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl border border-hero-line/70 [transform:translateZ(-28px)]"
            />
            <div className="relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(16px)]">
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-on-dark">
                  <span className="relative inline-flex size-1.5">
                    <span className="absolute inset-0 rounded-full bg-state-active" />
                    <span
                      ref={ping}
                      className="absolute inset-0 rounded-full border border-state-active"
                    />
                  </span>
                  COMPARISON LEDGER
                </p>
                <p className="text-xs font-semibold text-on-dark-muted">LIVE · HEARTBEAT 60s</p>
              </div>
              <ul className="divide-y divide-line bg-white">
                {stubRows.map((row) => (
                  <li key={row.name} className="flex items-center gap-4 px-5 py-3.5">
                    <span
                      aria-hidden="true"
                      className={
                        row.voice === "affirms"
                          ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                          : "flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                      }
                    >
                      {row.voice === "affirms" ? <CheckIcon className="size-3" /> : <MinusIcon className="size-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold tracking-[0.14em] text-ink">{row.name}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted">{row.desc}</p>
                    </div>
                    <span
                      className={
                        row.voice === "refuses"
                          ? "shrink-0 rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-semibold text-accent"
                          : "shrink-0 rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-semibold text-primary"
                      }
                    >
                      {row.tag}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between bg-primary-soft px-5 py-3">
                <p className="text-[0.6875rem] font-semibold text-primary">Two voices, one ledger</p>
                <p className="text-[0.6875rem] font-semibold text-primary">Signed terms, not policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x relative mt-12 pb-24 sm:pb-28 lg:pb-32">
        <div ref={jump}>
          <SectionJumpNav ariaLabel="Why Veracity sections" links={jumpLinks} />
        </div>
      </div>
    </section>
  );
}
