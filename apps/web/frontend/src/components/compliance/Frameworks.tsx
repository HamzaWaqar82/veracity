"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon } from "@/components/icons";
import { frameworks } from "./compliance-data";

const eu = frameworks.filter((f) => f.region === "European Union");
const states = frameworks.filter((f) => f.region === "US State");

export function Frameworks() {
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
          .fromTo(q(".js-fw-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-fw-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-fw-card"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 },
            "-=0.5",
          )
          .fromTo(
            q(".js-fw-band"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            "-=0.4",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="regulatory-frameworks" ref={root} className="scroll-mt-28 bg-white py-section">
      <div className="container-x">
        <h2 className="js-fw-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The regulatory frameworks we operate in.
        </h2>
        <p className="js-fw-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          GDPR, the EU AI Act, and US state electronic monitoring statutes — with the specific
          controls Veracity ships for each, current for the live product.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {eu.map((framework) => (
            <div
              key={framework.name}
              className="js-fw-card flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">{framework.name}</p>
                <p className="text-xs font-semibold text-on-dark-muted">{framework.region}</p>
              </div>
              <ul className="flex-1 space-y-3 px-5 py-6 sm:px-6">
                {framework.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-[0.15em] flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                    >
                      <CheckIcon className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {states.map((framework) => (
            <div
              key={framework.name}
              className="js-fw-card flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="flex items-center justify-between bg-ink px-5 py-3.5">
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">{framework.name}</p>
                <p className="text-xs font-semibold text-on-dark-muted">US STATE</p>
              </div>
              <ul className="flex-1 space-y-3 px-5 py-6 sm:px-5">
                {framework.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-[0.15em] flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                    >
                      <CheckIcon className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="js-fw-band mt-6 overflow-hidden rounded-2xl border border-line bg-primary-deep">
          <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-dark-muted">
                Jurisdiction-aware notice engine
              </p>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-on-dark">
                For all US state jurisdictions, Veracity provides the notice templates,
                acknowledgment tracking, and audit logging necessary to demonstrate compliance —
                applied automatically based on the organization&apos;s registered location.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-on-dark-line px-4 py-2 text-[0.8125rem] font-semibold text-on-dark">
              Right template, right jurisdiction
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
