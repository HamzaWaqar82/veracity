"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";

export function SubscribeSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        enter
          .fromTo(q(".js-sub-h"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-sub-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-sub-cta"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.55 },
            "-=0.3",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="subscribe" ref={root} className="scroll-mt-28 bg-white py-section">
      <div className="container-x">
        <div className="overflow-hidden rounded-2xl border border-line bg-primary-deep">
          <div className="flex flex-col gap-6 px-6 py-10 text-center sm:px-12 sm:py-14">
            <h2 className="js-sub-h mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-on-dark sm:text-4xl">
              New articles, published monthly.
            </h2>
            <p className="js-sub-lead mx-auto max-w-xl text-lg leading-relaxed text-on-dark-muted">
              Contact us at support@veracity.dev to suggest topics or ask questions. If we don&apos;t
              have the answer, we&apos;ll write it.
            </p>
            <div className="js-sub-cta flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:support@veracity.dev"
                className="btn btn-lg bg-on-dark text-primary-deep hover:bg-white"
              >
                Contact support@veracity.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
