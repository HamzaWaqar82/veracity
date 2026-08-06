"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { billingEntries } from "./pricing-data";

export function BillingDetails() {
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
          q(".js-bill-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-bill-row"),
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 },
            "-=0.4",
          )
          .fromTo(
            q(".js-bill-rule"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.6, stagger: 0.06 },
            "-=0.55",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="billing" className="scroll-mt-28 py-section">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="js-bill-h max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            The billing ledger.
          </h2>
          <p className="js-bill-h max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Every rule that touches your invoice, in exact numbers — written down the way it is
            enforced.
          </p>
        </div>

        <dl className="mt-10 rounded-2xl border border-line bg-bg">
          {billingEntries.map((entry, i) => (
            <div key={entry.title} className="js-bill-row">
              {i > 0 && <div className="js-bill-rule h-px origin-left bg-line" aria-hidden="true" />}
              <div className="grid gap-2 px-6 py-6 sm:px-8 md:grid-cols-[minmax(0,220px)_1fr] md:gap-8">
                <dt className="font-display text-lg font-semibold text-ink">{entry.title}</dt>
                <div>
                  <dd className="text-[0.9375rem] leading-relaxed text-muted">{entry.body}</dd>
                  {entry.flags?.map((flag) => (
                    <dd key={flag} className="mt-3 text-[0.8125rem] font-medium text-ink">
                      {flag}
                    </dd>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
