"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon, MinusIcon } from "@/components/icons";

const planTiers = [
  { name: "Starter", price: "$6", foot: "/ user / month" },
  { name: "Growth", price: "$12", foot: "/ user / month" },
  { name: "Enterprise", price: "$24", foot: "/ user / month" },
];

const planRows = [
  { feature: "Activity tracking (60s heartbeat)", cells: ["yes", "yes", "yes"] },
  { feature: "App and URL categorization", cells: ["yes", "yes", "yes"] },
  { feature: "Daily productivity score (0–100)", cells: ["yes", "yes", "yes"] },
  { feature: "Employee dashboard with SSE", cells: ["yes", "yes", "yes"] },
  { feature: "Meeting-aware idle detection", cells: ["yes", "yes", "yes"] },
  { feature: "Offline encrypted cache", cells: ["yes", "yes", "yes"] },
  { feature: "Screenshot monitoring", cells: ["no", "10-min interval", "Configurable 1–60 min"] },
  { feature: "Team benchmarking", cells: ["no", "Aggregate only", "Aggregate or identifiable"] },
  { feature: "REST API", cells: ["no", "1,000 req/hour", "10,000 req/hour"] },
  { feature: "SSO / SAML 2.0", cells: ["no", "no", "yes"] },
  { feature: "Support", cells: ["Email (1 business day)", "In-app chat (4 hours)", "Dedicated + 24/7"] },
  { feature: "User limit", cells: ["10", "50", "Unlimited"] },
  { feature: "Custom data retention", cells: ["no", "no", "yes"] },
  { feature: "Compliance reports", cells: ["no", "no", "yes"] },
];

export function Plans() {
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
          q(".js-plans-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-plans-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-plans-wrap"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            "-=0.2",
          )
          .fromTo(
            q(".js-plans-foot"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.35",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-y border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="js-plans-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Transparent Pricing for Every Team Size
        </h2>
        <p className="js-plans-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Simple, predictable pricing with no seat minimum and no add-on creep. Every tier ships
          with the same trust-preserving defaults: no stealth mode, no keystroke logging, ever.
        </p>
        <div className="js-plans-wrap relative mt-12 overflow-x-auto rounded-2xl border border-line bg-bg">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm tabular-nums">
            <caption className="sr-only">
              Veracity pricing: Starter, Growth, and Enterprise plan features
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-5 py-5 font-sans text-sm font-medium text-muted sm:px-7">
                  Feature
                </th>
                {planTiers.map((tier) => (
                  <th key={tier.name} scope="col" className="px-5 py-5 sm:px-7">
                    <span className="block font-display text-lg font-semibold">{tier.name}</span>
                    <span className="mt-1 block text-sm font-semibold text-primary">
                      {tier.price}
                      <span className="font-normal text-muted"> {tier.foot}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planRows.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="px-5 py-4 font-sans text-sm font-medium text-ink sm:px-7">
                    {row.feature}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className="px-5 py-4 text-sm text-muted sm:px-7">
                      {cell === "yes" ? (
                        <span className="text-primary">
                          <CheckIcon className="size-4" />
                          <span className="sr-only">Included</span>
                        </span>
                      ) : cell === "no" ? (
                        <span className="text-line">
                          <MinusIcon className="size-4" />
                          <span className="sr-only">Not included</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="js-plans-foot mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          See the{" "}
          <Link href="/features" className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary">
            Features page
          </Link>{" "}
          for a detailed breakdown and the{" "}
          <Link href="/pricing" className="font-semibold text-ink underline decoration-line underline-offset-4 hover:text-primary">
            Pricing page
          </Link>{" "}
          for complete pricing information.
        </p>
      </div>
    </section>
  );
}
