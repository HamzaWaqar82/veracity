"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "Status-check meetings dropped 60% once we stopped guessing. Every employee sees the same data their managers see, and once people saw the data was genuinely transparent, Private Time usage fell to almost zero. We get real productivity analytics without a surveillance culture, and that is why the team accepted it.",
    attribution: "Sarah Chen, CEO, Luminate Digital (45 employees)",
  },
  {
    quote:
      "As a compliance officer I have reviewed a lot of monitoring tools, and Veracity is the first that genuinely prioritizes privacy. During a client audit we demonstrated work activity correlated with billable entries for 95% of the disputed period, with 100% of policy acknowledgments on file. Defensible compliance, without the surveillance baggage.",
    attribution: "Marcus Okonkwo, Head of Compliance, Helios Consulting (120 employees)",
  },
];

const stats = [
  { value: "60%", label: "fewer status-check meetings" },
  { value: "95%", label: "audit evidence correlation" },
  { value: "100%", label: "policy acknowledgments on file" },
];

export function Testimonials() {
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
          q(".js-testi-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-testi-stats"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 },
            "-=0.4",
          )
          .fromTo(
            q(".js-testi-quote"),
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.16 },
            "-=0.4",
          )
          .fromTo(
            q(".js-testi-fig"),
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.16 },
            "-=0.3",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-y border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="js-testi-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Trusted by Growing Teams
        </h2>
        <ul className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
          {stats.map((s) => (
            <li key={s.label} className="js-testi-stats flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold tabular-nums text-primary sm:text-4xl">
                {s.value}
              </span>
              <span className="max-w-[11rem] text-sm font-medium leading-snug text-muted">
                {s.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-line">
          {testimonials.map((t, i) => (
            <figure key={t.attribution} className={i === 0 ? "js-testi-quote lg:pr-16" : "js-testi-quote lg:pl-16"}>
              <blockquote className="font-display text-xl font-medium leading-snug text-ink sm:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="js-testi-fig mt-7 text-sm font-medium text-muted">
                — {t.attribution}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
