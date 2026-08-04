"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { retRows, deletion, portability } from "./compliance-data";

export function RetentionSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
        enter
          .fromTo(q(".js-ret-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-ret-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-ret-card"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="data-processing-and-retention"
      ref={root}
      className="scroll-mt-28 bg-white py-section"
    >
      <div className="container-x">
        <h2 className="js-ret-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Data processing and retention.
        </h2>
        <p className="js-ret-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Automated deletion at the end of the configured retention period, no grace period. On
          cancellation, a 30-day window for reactivation — then permanent deletion. And every
          employee can export their own data at any time.
        </p>

        <div className="js-ret-card mt-12 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_28px_60px_-28px_rgba(27,67,50,0.25)]">
          <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">RETENTION PERIODS</p>
            <p className="text-xs font-semibold text-on-dark-muted">CONFIGURABLE ON ENTERPRISE</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Data type
                  </th>
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Default retention
                  </th>
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Enterprise configurable
                  </th>
                </tr>
              </thead>
              <tbody>
                {retRows.map((row) => (
                  <tr key={row.type} className="border-b border-line last:border-b-0 hover:bg-white/70">
                    <th scope="row" className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-ink sm:px-6">
                      {row.type}
                    </th>
                    <td className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-primary sm:px-6">
                      {row.retention}
                    </td>
                    <td className="px-5 py-4 align-top text-[0.9375rem] text-muted sm:px-6">
                      {row.configurable ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="js-ret-card overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">DELETION</p>
            </div>
            <ul className="space-y-3 px-5 py-6 sm:px-6">
              {deletion.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="js-ret-card overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">DATA PORTABILITY</p>
            </div>
            <ul className="space-y-3 px-5 py-6 sm:px-6">
              {portability.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
