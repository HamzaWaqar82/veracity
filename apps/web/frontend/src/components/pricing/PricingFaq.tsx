"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { ChevronIcon } from "@/components/icons";
import { billingFaqs } from "./pricing-data";

export function PricingFaq() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        tl.fromTo(
          q(".js-faq-h"),
          { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-faq-row"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
            "-=0.4",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="js-faq-h max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Billing questions, answered straight.
          </h2>
          <p className="js-faq-h max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Anything else, ask sales at sales@veracity.dev - you get the same answer in writing.
          </p>
        </div>

        <div className="js-faq-row mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
          {billingFaqs.map((faq) => (
            <details
              key={faq.q}
              className="group px-6 py-5 sm:px-8"
              aria-label={faq.q}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.0625rem] font-semibold leading-snug text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronIcon className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
