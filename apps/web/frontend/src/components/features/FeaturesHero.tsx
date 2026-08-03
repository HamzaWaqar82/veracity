"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";
import { attachMagnetic } from "@/lib/cursor";

const headlineWords = "Features, down to the exact interval.".split(" ");

const jumpLinks = [
  { label: "Track", href: "#track" },
  { label: "Understand", href: "#understand" },
  { label: "Control", href: "#control" },
];

export function FeaturesHero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLParagraphElement>(null);
  const lede = useRef<HTMLParagraphElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const jump = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const linkEls = gsap.utils.toArray<HTMLElement>(".js-jump-link", root.current!);
      jumpLinks.forEach(({ href }) => {
        const anchor = document.getElementById(href.slice(1));
        const linkEl = linkEls.find((l) => l.getAttribute("href") === href);
        if (!anchor || !linkEl) return;
        const trigger = anchor.closest("section") ?? anchor;
        ScrollTrigger.create({
          trigger,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) {
              linkEl.classList.add("is-active");
              linkEl.setAttribute("aria-current", "true");
            } else {
              linkEl.classList.remove("is-active");
              linkEl.removeAttribute("aria-current");
            }
          },
        });
      });

      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.fromTo(badge.current, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.08)
          .fromTo(
            q(".js-feature-word"),
            { yPercent: 118 },
            { yPercent: 0, duration: 1.0, stagger: 0.05, ease: "power3.inOut" },
            0.28,
          )
          .fromTo(lede.current, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.85)
          .fromTo(
            q(".js-feature-cta"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 },
            1.0,
          )
          .fromTo(note.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.16)
          .fromTo(jump.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 1.26);

        gsap.to(content.current, {
          y: -56,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      });

      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.desktop) return;
        const magneticCleanups = gsap.utils
          .toArray<HTMLElement>(".js-feature-cta", root.current!)
          .map((el) => attachMagnetic(el, 140, 0.4));
        return () => magneticCleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-mint text-hero-ink">
      <div
        ref={content}
        className="container-x relative pt-32 text-center sm:pt-40 lg:pt-44"
      >
        <p
          ref={badge}
          className="inline-flex items-center gap-2 rounded-full border border-hero-line px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.02em]"
        >
          Specification-grade · No marketing gloss
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-display text-[clamp(2.5rem,4vw+1.5rem,4rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          {headlineWords.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
                <span className="js-feature-word inline-block will-change-transform">{word}</span>
              </span>
              {i < headlineWords.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p ref={lede} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-hero-muted">
          The complete Veracity specification — every tier on one page, with the real numbers:
          heartbeat intervals, idle thresholds, screenshot intervals, and the published scoring
          formula. Cloud-native SaaS only; no on-premise deployment.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/early-access" className="btn btn-lg btn-primary js-feature-cta">
            Start Free Trial
          </Link>
          <Link href="/pricing" className="btn btn-lg btn-outline-hero js-feature-cta">
            Compare plans
          </Link>
        </div>
        <p ref={note} className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-hero-muted">
          <span>14-day free trial</span>
          <span className="text-hero-line" aria-hidden="true">·</span>
          <span>No credit card</span>
          <span className="text-hero-line" aria-hidden="true">·</span>
          <span>No seat minimum</span>
        </p>
      </div>

      <div className="container-x relative mt-14 pb-24 sm:pb-28 lg:pb-32">
        <nav
          ref={jump}
          aria-label="Feature sections"
          className="mx-auto inline-flex max-w-full items-center overflow-hidden rounded-full border border-hero-line/70 bg-white/30"
        >
          <span className="hidden py-2.5 pl-5 pr-3 text-[0.8125rem] font-semibold text-hero-muted sm:block">
            Jump to
          </span>
          <div className="flex divide-x divide-hero-line/70">
            {jumpLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="js-jump-link px-4 py-2.5 text-[0.8125rem] font-semibold text-hero-ink transition-colors hover:bg-white/50 sm:px-6"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
