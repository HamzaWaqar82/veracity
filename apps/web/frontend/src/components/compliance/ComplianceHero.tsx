"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { SectionJumpNav } from "@/components/common/SectionJumpNav";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { CTA } from "@/lib/cta";

const headlineWords = "Compliance as architecture, not an afterthought.".split(" ");

const jumpLinks = [
  { label: "Collection", href: "#data-collection-what-we-collect-and-what-we-do-not" },
  { label: "Frameworks", href: "#regulatory-frameworks" },
  { label: "Security", href: "#security-architecture" },
  { label: "Retention", href: "#data-processing-and-retention" },
  { label: "Disclosure", href: "#responsible-disclosure" },
];

const ledgerRows = [
  {
    name: "APPLICATION USAGE",
    desc: "App name, window title, URL domain at 60 s heartbeat",
    tag: "All plans",
    voice: "collects",
  },
  {
    name: "SCREENSHOTS",
    desc: "Periodic JPEG, client-side redacted, encrypted",
    tag: "Growth +",
    voice: "collects",
  },
  {
    name: "KEYSTROKES",
    desc: "Never logged at any tier",
    tag: "never",
    voice: "refuses",
  },
  {
    name: "AUDIO · VIDEO · WEBCAM",
    desc: "No microphone or camera access",
    tag: "never",
    voice: "refuses",
  },
  {
    name: "DATA RETENTION",
    desc: "Configurable, automated deletion",
    tag: "12 mo",
    voice: "collects",
  },
];

export function ComplianceHero() {
  const root = useRef<HTMLElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const jump = useRef<HTMLDivElement>(null);
  const ledger = useRef<HTMLDivElement>(null);
  const ping = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-comp-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { y: 22 }, { y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-comp-cta"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.16)
          .fromTo(
            ledger.current,
            { opacity: 0, x: 64, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 1.0 },
            0.6,
          )
          .fromTo(jump.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, 1.3);

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, opacity: 0.7 },
            { scale: 3.4, opacity: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 1.9 },
          );
        }
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="our-compliance-philosophy"
      className="relative overflow-hidden bg-mint text-hero-ink"
    >
      <div className="container-x grid items-center gap-14 pb-16 pt-32 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-44">
        <div className="min-w-0">
          <p
            ref={badge}
            className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
          >
            Compliance and Trust Center
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                  <span className="js-comp-word inline-block will-change-transform">{word}</span>
                </span>
                {i < headlineWords.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p ref={lede} className="mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
            Every data collection decision is auditable against a published retention policy. Every
            access to monitoring data is logged in a tamper-evident audit trail.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={CTA.trial} className="btn btn-lg btn-primary js-comp-cta">
              Start Free Trial
            </Link>
            <Link href={CTA.demo} className="btn btn-lg btn-outline-hero js-comp-cta">
              Request a demo
            </Link>
          </div>
          <p
            ref={note}
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted"
          >
            <span>Current as of the published date</span>
            <span className="text-hero-line" aria-hidden="true">
              ·
            </span>
            <span>Reflects the live product, not a roadmap</span>
          </p>
        </div>

        <div className="min-w-0">
          <div className="relative mx-auto w-full max-w-[30rem] [perspective:1400px] lg:max-w-none">
            <div
              ref={ledger}
              className="relative w-full [transform-style:preserve-3d]"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl border border-hero-line/70 [transform:translateZ(-24px)]"
              />
              <div className="relative overflow-hidden rounded-2xl bg-hero-panel shadow-[0_28px_60px_-28px_rgba(27,67,50,0.45)] [transform:translateZ(12px)]">
                <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                  <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                    COLLECTION POLICY LEDGER
                  </p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-on-dark-muted">
                    <span className="relative inline-flex size-1.5">
                      <span className="absolute inset-0 rounded-full bg-state-active" />
                      <span
                        ref={ping}
                        className="absolute inset-0 rounded-full border border-state-active"
                      />
                    </span>
                    AUDITED · LIVE
                  </p>
                </div>
                <ul className="divide-y divide-line bg-white">
                  {ledgerRows.map((row) => (
                    <li key={row.name} className="flex items-center gap-4 px-5 py-3.5">
                      <span
                        aria-hidden="true"
                        className={
                          row.voice === "refuses"
                            ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                            : "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                        }
                      >
                        {row.voice === "refuses" ? (
                          <MinusIcon className="size-3" />
                        ) : (
                          <CheckIcon className="size-3" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold tracking-[0.14em] text-ink">{row.name}</p>
                        <p className="mt-0.5 text-xs leading-snug text-muted">{row.desc}</p>
                      </div>
                      <span
                        className={
                          row.voice === "refuses"
                            ? "shrink-0 rounded-full border border-line px-2.5 py-1 text-[0.8125rem] font-semibold text-accent"
                            : "shrink-0 rounded-full border border-line bg-primary-soft px-2.5 py-1 text-[0.8125rem] font-semibold text-primary"
                        }
                      >
                        {row.tag}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between bg-primary-soft px-5 py-3">
                  <p className="text-xs font-semibold text-primary">Signed · published policy</p>
                  <p className="text-xs font-semibold text-primary">Reflects the live product</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x pb-24 sm:pb-28 lg:pb-32">
        <div ref={jump}>
          <SectionJumpNav ariaLabel="Compliance and Trust sections" links={jumpLinks} />
        </div>
      </div>
    </section>
  );
}
