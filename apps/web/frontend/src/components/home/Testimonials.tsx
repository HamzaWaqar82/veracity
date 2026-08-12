"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";

const partners = [
  {
    quote:
      "We were making resourcing calls on who sounded busiest, not who had the most capacity. We want every person to see the same data we do, so transparency does the trust-building instead of us having to argue for it.",
    attribution: "Operations lead, remote software team · early design partner",
  },
  {
    quote:
      "Our client audits want evidence that billable hours reflect real work, and our partners refuse anything that feels like surveillance. We need defensible proof that does not come with a trust cost.",
    attribution: "Head of compliance, professional services firm · early design partner",
  },
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
          { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-testi-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-testi-quote"),
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.16 },
            "-=0.4",
          )
          .fromTo(
            q(".js-testi-fig"),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.16 },
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
          Built with Early Design Partners
        </h2>
        <p className="js-testi-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The operators and compliance leads we are building with are not looking for another tool
          to hide from. They want visibility that earns trust.
        </p>
        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-line">
          {partners.map((p, i) => (
            <figure
              key={p.attribution}
              className={i === 0 ? "js-testi-quote lg:pr-16" : "js-testi-quote lg:pl-16"}
            >
              <blockquote className="font-display text-xl font-medium leading-snug text-ink sm:text-2xl">
                &ldquo;{p.quote}&rdquo;
              </blockquote>
              <figcaption className="js-testi-fig mt-7 text-sm font-medium text-muted">
                {p.attribution}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
