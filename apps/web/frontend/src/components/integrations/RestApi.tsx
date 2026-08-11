"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { endpoints } from "./integrations-data";

const rateLimits = [
  { plan: "Growth", limit: "1,000", unit: "requests per hour" },
  { plan: "Enterprise", limit: "10,000", unit: "requests per hour" },
];

export function RestApi() {
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
          .fromTo(q(".js-api-h"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-api-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-api-card"),
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="rest-api" ref={root} className="scroll-mt-28 bg-white py-section">
      <div className="container-x">
        <h2 className="js-api-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The REST API, documented and gated.
        </h2>
        <p className="js-api-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Bearer-token authentication with keys you generate and revoke, rate limits published by
          plan, and endpoints covering activity, scores, benchmarking, disputes, and compliance
          reporting.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="js-api-card overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-2">
            <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">RATE LIMITS</p>
              <p className="text-xs font-semibold text-on-dark-muted">PER HOUR</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line">
              {rateLimits.map((row) => (
                <div key={row.plan} className="bg-white px-6 py-6">
                  <p className="text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-muted">
                    {row.plan}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                    {row.limit}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-muted">{row.unit}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-primary-soft px-6 py-4">
              <p className="text-[0.8125rem] font-semibold text-primary">
                Keys generated from Organization Settings · rotated or revoked at any time
              </p>
            </div>
          </div>

          <div className="js-api-card overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-3">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">AVAILABLE ENDPOINTS</p>
              <p className="text-xs font-semibold text-on-dark-muted">REST · BEARER AUTH</p>
            </div>
            <div className="divide-y divide-line">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.resource}
                  className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-start sm:gap-4 sm:px-6"
                >
                  <span className="shrink-0 self-start rounded-md bg-primary-soft px-2 py-0.5 font-mono text-[0.8125rem] font-bold leading-5 text-primary">
                    {endpoint.method}
                  </span>
                  <div>
                    <p className="font-mono text-[0.8125rem] font-semibold leading-6 text-ink">
                      {endpoint.resource}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted">
                      {endpoint.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-white px-5 py-4 sm:px-6">
              <p className="text-[0.875rem] font-medium text-ink">
                Full API documentation with request and response schemas, example requests, and
                error codes is provided after account creation at{" "}
                <a
                  href="https://docs.veracity.dev/api"
                  className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
                >
                  docs.veracity.dev/api
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
