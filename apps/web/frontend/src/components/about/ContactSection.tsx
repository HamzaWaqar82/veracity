"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { supportRows, emails, demoItems, availability, office } from "./about-data";

export function ContactSection() {
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
          .fromTo(q(".js-contact-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-contact-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-contact-col"),
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className="scroll-mt-28 border-t border-line bg-white py-section">
      <div className="container-x">
        <h2 className="js-contact-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Talk to us.
        </h2>
        <p className="js-contact-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A question about Veracity, a demo request, or help with your account — the team is here
          to help. {availability}
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="js-contact-col overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">SUPPORT CHANNELS</p>
              <p className="text-xs font-semibold text-on-dark-muted">SLA TABLE</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                      Channel
                    </th>
                    <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                      Availability
                    </th>
                    <th scope="col" className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6">
                      Target response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supportRows.map((row) => (
                    <tr key={row.channel} className="border-b border-line last:border-b-0 hover:bg-white/60">
                      <th scope="row" className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-ink sm:px-6">
                        {row.channel}
                      </th>
                      <td className="px-5 py-4 align-top text-[0.9375rem] text-muted sm:px-6">{row.availability}</td>
                      <td className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-primary sm:px-6">
                        {row.response}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-line bg-white/60 px-5 py-5 sm:px-6">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
                Contact email addresses
              </p>
              <ul className="mt-3 space-y-1.5">
                {emails.map((item) => (
                  <li key={item.email} className="flex flex-wrap gap-x-2 text-[0.9375rem]">
                    <span className="font-semibold text-ink">{item.label}:</span>
                    <a
                      href={`mailto:${item.email}`}
                      className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
                    >
                      {item.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="js-contact-col flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
              <p className="text-xs font-bold tracking-[0.16em] text-on-dark">BOOK A DEMO</p>
              <p className="text-xs font-semibold text-on-dark-muted">30 MINUTES · LIVE</p>
            </div>
            <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
              <p className="text-[0.9375rem] leading-relaxed text-muted">
                A live demonstration of Veracity for teams evaluating the platform. A typical demo
                runs thirty minutes and covers:
              </p>
              <ul className="mt-4 space-y-2.5">
                {demoItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                <Link href="/pricing" className="btn btn-primary js-about-cta">
                  Start Free Trial
                </Link>
                <a href="mailto:sales@veracity.dev" className="btn btn-outline">
                  Email sales@veracity.dev
                </a>
              </div>
              <p className="mt-5 text-sm font-medium text-muted">{office}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
