"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { encRows, keyMgmt, accessControls } from "./compliance-data";

const auditTrail = [
  "Who accessed the data — user ID, role, IP address",
  "What data was accessed — data type, scope, record IDs",
  "When the access occurred — UTC timestamp",
  "Whether the access was successful, and the action taken — view, export, modify, delete",
];

export function SecuritySection() {
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
          .fromTo(q(".js-sec-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-sec-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-sec-card"),
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
      id="security-architecture"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-sec-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Security architecture.
        </h2>
        <p className="js-sec-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Encryption at every layer, keys managed separately from data, and every access to
          monitoring data recorded in an immutable, tamper-evident audit trail.
        </p>

        <div className="js-sec-card mt-12 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_28px_60px_-28px_rgba(27,67,50,0.25)]">
          <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">ENCRYPTION STANDARDS</p>
            <p className="text-xs font-semibold text-on-dark-muted">TLS 1.3 · AES-256</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Layer
                  </th>
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Standard
                  </th>
                  <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {encRows.map((row) => (
                  <tr key={row.layer} className="border-b border-line last:border-b-0 hover:bg-surface">
                    <th scope="row" className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-ink sm:px-6">
                      {row.layer}
                    </th>
                    <td className="px-5 py-4 align-top text-[0.9375rem] font-bold text-primary sm:px-6">
                      {row.standard}
                    </td>
                    <td className="px-5 py-4 align-top text-[0.9375rem] leading-relaxed text-muted sm:px-6">
                      {row.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="js-sec-card overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">KEY MANAGEMENT</p>
            </div>
            <ul className="space-y-3 px-5 py-6 sm:px-6">
              {keyMgmt.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="js-sec-card overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">ACCESS CONTROLS</p>
            </div>
            <ul className="space-y-3 px-5 py-6 sm:px-6">
              {accessControls.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="js-sec-card overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between bg-ink px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">AUDIT TRAIL</p>
            </div>
            <div className="px-5 py-6 sm:px-6">
              <p className="text-[0.875rem] leading-relaxed text-muted">
                Every access to monitoring data is logged in a tamper-evident audit trail that
                records:
              </p>
              <ul className="mt-3 space-y-2.5">
                {auditTrail.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-muted">
                    <span aria-hidden="true" className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-4 text-[0.875rem] font-semibold text-ink">
                The audit trail is immutable — no record can be modified or deleted after creation,
                and logs are retained for 24 months minimum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
