"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { disclosureDocs } from "./compliance-data";

export function DisclosureSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        enter
          .fromTo(q(".js-disc-h"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-disc-card"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="responsible-disclosure"
      ref={root}
      className="scroll-mt-28 border-t border-line bg-surface py-section"
    >
      <div className="container-x grid gap-6 lg:grid-cols-2">
        <div className="js-disc-card flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">RESPONSIBLE DISCLOSURE</p>
          </div>
          <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
            <p className="text-[0.9375rem] leading-relaxed text-muted">
              Veracity operates a responsible disclosure program for security vulnerabilities. To
              report a security issue:
            </p>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-relaxed text-ink">
              <li className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-primary" />
                Acknowledgment of receipt within 48 hours
              </li>
              <li className="flex items-start gap-2.5">
                <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-primary" />
                Initial assessment within 5 business days
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <a
                href="mailto:security@veracity.dev"
                className="btn btn-primary js-disc-cta"
              >
                Report to security@veracity.dev
              </a>
            </div>
          </div>
        </div>

        <div className="js-disc-card flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between bg-ink px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">COMPLIANCE DOCUMENTATION</p>
          </div>
          <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
            <p className="text-[0.9375rem] leading-relaxed text-muted">
              The following documents are available on request by emailing privacy@veracity.dev:
            </p>
            <ul className="mt-4 space-y-2.5">
              {disclosureDocs.map((doc) => (
                <li key={doc} className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-accent" />
                  {doc}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <a href="mailto:privacy@veracity.dev" className="btn btn-outline js-disc-cta">
                Request documents
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
