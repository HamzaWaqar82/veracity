"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { ArrowIcon } from "@/components/icons";
import { attachMagnetic, attachNudge, attachSpotlight } from "@/lib/cursor";

export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const spotlight = useRef<HTMLDivElement>(null);
  const arrowWrap = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 80%" },
        });
        tl.fromTo(
          panel.current,
          { autoAlpha: 0, scale: 0.9, y: 38 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.95 },
        )
          .fromTo(
            q(".js-cta-h"),
            { autoAlpha: 0, y: 22, clipPath: "inset(0 0 100% 0)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.8 },
            "-=0.5",
          )
          .fromTo(
            q(".js-cta-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-cta-links"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 },
            "-=0.3",
          );

        gsap.to(panel.current, {
          scale: 0.97,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const cleanups: (() => void)[] = [];
        if (spotlight.current) cleanups.push(attachSpotlight(spotlight.current));
        q(".js-cta-magnet").forEach((el) => cleanups.push(attachMagnetic(el as HTMLElement, 140, 0.4)));
        if (arrowWrap.current) cleanups.push(attachNudge(arrowWrap.current));
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section-sm">
      <div className="container-x">
        <div
          ref={panel}
          className="relative overflow-hidden rounded-3xl bg-primary-deep px-6 py-16 text-center sm:px-16 sm:py-24"
        >
          <div
            ref={spotlight}
            aria-hidden="true"
            className="cta-spotlight pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "42rem",
              height: "42rem",
              marginLeft: "-21rem",
              marginTop: "-21rem",
            }}
          />
          <h2 className="js-cta-h mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-on-dark sm:text-4xl lg:text-5xl">
            Ready to See the Difference?
          </h2>
          <p className="js-cta-lead mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted">
            You don&apos;t have to choose between visibility and trust. Start a 14-day free trial with
            full access to every feature of your plan — no credit card, no seat minimum, cancel
            anytime. Explore the features, compare plans, or talk to sales for a guided walkthrough.
          </p>
          <div className="js-cta-links mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/pricing" className="js-cta-magnet btn btn-lg btn-inverse w-full sm:w-auto">
              Start Free Trial
            </Link>
          </div>
          <p className="js-cta-links mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.9375rem]">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 font-semibold text-on-dark underline decoration-on-dark-line underline-offset-4 hover:text-white"
            >
              Explore Features{" "}
              <span ref={arrowWrap} className="inline-block">
                <ArrowIcon className="size-4" />
              </span>
            </Link>
            <span className="text-on-dark-line" aria-hidden="true">
              ·
            </span>
            <Link
              href="/pricing"
              className="font-semibold text-on-dark underline decoration-on-dark-line underline-offset-4 hover:text-white"
            >
              View Pricing
            </Link>
            <span className="text-on-dark-line" aria-hidden="true">
              ·
            </span>
            <Link
              href="/case-studies"
              className="font-semibold text-on-dark underline decoration-on-dark-line underline-offset-4 hover:text-white"
            >
              Read Case Studies
            </Link>
            <span className="text-on-dark-line" aria-hidden="true">
              ·
            </span>
            <Link
              href="/about"
              className="font-semibold text-on-dark underline decoration-on-dark-line underline-offset-4 hover:text-white"
            >
              Contact Sales
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
