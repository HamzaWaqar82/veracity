"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { TiltCard } from "@/components/common/TiltCard";
import { IntegrationMark } from "./IntegrationMark";
import { integrations } from "./integrations-data";

export function IntegrationsGrid() {
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
          .fromTo(
            q(".js-int-h"),
            { opacity: 0, y: 26, clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(
            q(".js-int-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-int-card"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="integrations" ref={root} className="scroll-mt-28 border-y border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="js-int-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Five integrations, live today.
        </h2>
        <p className="js-int-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every integration described here is included in your plan - setup in minutes, read-only
          where it matters, and never writing to your other systems.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {integrations.map((integration) => (
            <TiltCard
              key={integration.id}
              maxAngle={1.5}
              className="js-int-card flex h-full flex-col rounded-2xl border border-line bg-white"
            >
              <div
                className={
                  integration.id === "rest-api"
                    ? "flex items-center justify-between bg-primary-deep px-5 py-3.5"
                    : "flex items-center justify-between bg-ink px-5 py-3.5"
                }
              >
                <p className="text-xs font-bold tracking-[0.16em] text-on-dark">
                  <span className="mr-2 text-on-dark-muted">~/</span>
                  {integration.handle}
                </p>
                <p className="text-xs font-semibold text-on-dark-muted">{integration.plans}</p>
              </div>

              <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    {integration.name}
                  </h3>
                  <IntegrationMark icon={integration.icon} className="size-7 shrink-0" />
                </div>
                <p className="mt-1 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-primary">
                  {integration.tag}
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                  {integration.summary}
                </p>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {integration.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-muted">
                      <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                {integration.setup && (
                  <p className="mt-5 border-t border-line pt-4 text-[0.8125rem] font-medium leading-relaxed text-ink">
                    {integration.setup}
                  </p>
                )}
              </div>
            </TiltCard>
          ))}

          <TiltCard
            maxAngle={1.5}
            className="js-int-card flex h-full flex-col justify-center rounded-2xl border border-dashed border-primary/50 bg-primary-soft/50 px-6 py-8 sm:px-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Building something custom?
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink">
              Every Growth and Enterprise plan includes the REST API for custom integrations, data
              export, and workflow automation. Integration priorities are driven by customer demand.
            </p>
            <p className="mt-5">
              <a
                href="mailto:sales@veracity.dev?subject=Integration%20request"
                className="text-[0.875rem] font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Request an integration at sales@veracity.dev
              </a>
            </p>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
