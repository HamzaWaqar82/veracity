"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { customerQuotes } from "./why-data";

export function CustomersSay() {
  const root = useRef<HTMLElement>(null);

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
          q(".js-customers-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-customers-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-customers-card"),
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12 },
            "-=0.35",
          )
          .fromTo(
            q(".js-customers-mark"),
            { autoAlpha: 0, scale: 0.4 },
            { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)", stagger: 0.12 },
            "-=0.5",
          )
          .fromTo(
            q(".js-customers-rule"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, stagger: 0.12 },
            "-=0.35",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="what-customers-say" ref={root} className="scroll-mt-28 py-section">
      <div className="container-x">
        <h2 className="js-customers-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          What customers say.
        </h2>
        <p className="js-customers-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Transparent monitoring, in the words of the people who run it - from the CEO who chose it
          to the compliance officer who audits it.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {customerQuotes.map((quote) => (
            <figure
              key={quote.attribution}
              className="js-customers-card flex flex-col rounded-2xl border border-line bg-bg p-7 transition-transform duration-200 ease-out hover:-translate-y-1 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="js-customers-mark font-display text-4xl leading-none text-accent"
              >
                &ldquo;
              </span>
              <blockquote className="mt-3 font-display text-[1.0625rem] italic leading-relaxed text-ink">
                {quote.text}
              </blockquote>
              <figcaption className="mt-7 overflow-hidden pt-5">
                <div className="js-customers-rule h-px w-full origin-left bg-line" aria-hidden="true" />
                <p className="mt-5 text-[0.9375rem] font-semibold text-ink">{quote.attribution}</p>
                <p className="mt-0.5 text-[0.8125rem] text-muted">{quote.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="js-customers-lead mt-10 text-[0.9375rem] leading-relaxed text-muted">
          <Link
            href="/case-studies"
            className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
          >
            Read detailed case studies
          </Link>{" "}
          ·{" "}
          <Link
            href="/pricing"
            className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
          >
            View pricing
          </Link>{" "}
          ·{" "}
          <Link
            href="/about"
            className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary"
          >
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
