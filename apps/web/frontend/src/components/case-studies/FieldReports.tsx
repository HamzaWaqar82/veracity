"use client";

import { useRef } from "react";
import { gsap, useGSAP, REVEAL, MOTION } from "@/lib/motion";
import { TiltCard } from "@/components/common/TiltCard";
import { ChevronIcon } from "@/components/icons";
import { fieldReports } from "./case-studies-data";

export function FieldReports() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: REVEAL.to.ease },
          scrollTrigger: { trigger: root.current, start: "top 68%" },
        });
        enter
          .fromTo(
            q(".js-reports-h"),
            { opacity: 0, y: 26, clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(q(".js-reports-lead"), REVEAL.from, REVEAL.to, "-=0.4")
          .fromTo(
            q(".js-report-card"),
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.14 },
            "-=0.5",
          )
          .fromTo(
            q(".js-report-stat"),
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="field-reports"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-reports-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Three field reports, anonymized.
        </h2>
        <p className="js-reports-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Each report describes a real deployment: the challenge, the rollout, and the outcome.
          Names are anonymized to roles; the numbers and quotes are from the teams themselves.
        </p>

        <div className="mt-12 space-y-8">
          {fieldReports.map((report, index) => (
            <article
              key={report.id}
              id={report.id}
              className="js-report-card scroll-mt-28 [perspective:1400px]"
            >
              <TiltCard maxAngle={1.5} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-primary-deep px-5 py-3.5 sm:px-8">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                  FIELD REPORT {String(index + 1).padStart(2, "0")} · {report.descriptor}
                </p>
                <p className="text-xs font-semibold text-on-dark-muted">{report.tagline}</p>
              </div>

              <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Industry", value: report.industry },
                  { label: "Size", value: report.size },
                  { label: "Plan", value: report.plan },
                  { label: "Time with Veracity", value: report.time },
                ].map((item) => (
                  <div key={item.label} className="bg-white px-5 py-4 sm:px-6">
                    <p className="text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-muted">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[0.875rem] font-semibold leading-snug text-ink">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-x-10 gap-y-8 px-5 py-8 sm:px-8 lg:grid-cols-2">
                <div>
                  <details className="group" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary [&::-webkit-details-marker]:hidden">
                      The challenge
                      <ChevronIcon className="size-4 shrink-0 text-primary/70 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                      {report.challenge}
                    </p>
                  </details>
                  {report.challengeQuote && (
                    <blockquote className="mt-4 border-l-2 border-primary/40 pl-4 text-[0.9375rem] font-medium italic leading-relaxed text-ink">
                      {report.challengeQuote}
                    </blockquote>
                  )}
                </div>
                <div>
                  <details className="group" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary [&::-webkit-details-marker]:hidden">
                      The solution
                      <ChevronIcon className="size-4 shrink-0 text-primary/70 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                      {report.solution}
                    </p>
                  </details>
                  {report.solutionQuote && (
                    <blockquote className="mt-4 border-l-2 border-primary/40 pl-4 text-[0.9375rem] font-medium italic leading-relaxed text-ink">
                      {report.solutionQuote}
                    </blockquote>
                  )}
                </div>
              </div>

              <div className="border-y border-line bg-surface px-5 py-6 sm:px-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Results
                </h3>
                <div className="mt-5 grid gap-6 sm:grid-cols-3">
                  {report.stats.map((stat) => (
                    <div key={stat.label} className="js-report-stat">
                      <p className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-[0.875rem] leading-snug text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-6 sm:px-8">
                <ul className="space-y-2.5">
                  {report.results.map((result) => (
                    <li
                      key={result}
                      className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-muted"
                    >
                      <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-primary" />
                      {result}
                    </li>
                  ))}
                </ul>

                <blockquote className="mt-7 rounded-xl bg-primary-soft px-6 py-5">
                  <p className="text-[0.9375rem] font-medium italic leading-relaxed text-primary">
                    &ldquo;{report.quote}&rdquo;
                  </p>
                  <footer className="mt-3 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-primary/80"> - {report.persona}
                  </footer>
                </blockquote>
              </div>
              </TiltCard>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
