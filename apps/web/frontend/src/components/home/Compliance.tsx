"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon } from "@/components/icons";

const complianceItems = [
  { label: "No keystroke logging", rest: " — ever, at any tier" },
  { label: "No audio or video recording", rest: " — continuous recording is out of scope by design" },
  { label: "No stealth mode", rest: " — Agent is always visible and identifiable" },
  { label: "Encryption in transit", rest: ": TLS 1.3" },
  { label: "Encryption at rest", rest: ": AES-256 with per-file keys for screenshots" },
  { label: "Client-side redaction", rest: ": Sensitive fields redacted before upload" },
  { label: "Sensitive-app exclusion", rest: ": Configurable list; defaults include password managers and banking domains" },
  { label: "Tamper-evident audit logging", rest: ": Every access to monitoring data is logged" },
  { label: "Automated data retention", rest: ": Configurable per data type with enforced deletion" },
  { label: "Private Time", rest: ": Employee-initiated capture pause, enforced locally even offline, with configurable daily limits" },
];

export function Compliance() {
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
          q(".js-compliance-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-compliance-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-compliance-item"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 },
            "-=0.2",
          )
          .fromTo(
            q(".js-compliance-item .js-check-path"),
            { strokeDashoffset: 26 },
            { strokeDashoffset: 0, duration: 0.45, stagger: 0.06 },
            "-=0.2",
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section-sm">
      <div className="container-x">
        <h2 className="js-compliance-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Compliance and Security Highlights
        </h2>
        <p className="js-compliance-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Ten guarantees, stated plainly, each one enforced in the product rather than promised in
          the marketing.
        </p>
        <ul className="mt-12 grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {complianceItems.map((item) => (
            <li key={item.label} className="js-compliance-item flex items-start gap-3 text-[0.9375rem] leading-relaxed">
              <CheckIcon pathClassName="js-check-path" className="mt-1 size-4 shrink-0 text-pine" />
              <span>
                <strong className="font-semibold">{item.label}</strong>
                {item.rest}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
