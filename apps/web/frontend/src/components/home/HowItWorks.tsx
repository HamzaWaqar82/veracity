"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";

const components = [
  {
    n: "01",
    name: "The Agent",
    body: "Install one lightweight Agent on each workstation. It captures application usage, window titles, and URL visits at sixty-second heartbeat intervals, then transmits them to the server over encrypted TLS 1.3 connections. Optional screenshots are redacted and encrypted client-side before upload. Works on Windows 10 and 11, macOS Ventura and later, and major Linux distributions including Ubuntu 22.04 and later.",
    specs: ["TLS 1.3 in transit", "Windows · macOS · Linux"],
  },
  {
    n: "02",
    name: "The Server",
    body: "A cloud-hosted backend turns raw activity into honest signal. It classifies events into productivity categories with a configurable engine, calculates daily scores using a published methodology, and streams results to the web portal over real-time SSE and REST APIs. It also manages organization policies, user roles, compliance controls, and data retention with automated deletion.",
    specs: ["REST + real-time SSE", "Published scoring methodology"],
  },
  {
    n: "03",
    name: "The Web Portal",
    body: "A responsive web app for managers, employees, and admins. Managers see team dashboards with productivity trends, benchmarking data, and activity logs. Employees see their own identical dashboard with the same data. Administrators configure policies, manage users, view audit logs, and generate compliance reports.",
    specs: ["Employee view = manager view", "Compliance reports"],
  },
];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = ctx.conditions?.desktop;

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-how-h"),
          { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-how-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-how-col"),
            { opacity: 0, y: 34 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.14 },
            "-=0.2",
          );

        if (desktop) {
          q(".js-how-num").forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: 18 },
              {
                yPercent: -18,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
              },
            );
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-y border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="js-how-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          How Veracity Works
        </h2>
        <p className="js-how-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Three components, one shared data set. The same data on both sides of every screen.
        </p>
        <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-line">
          {components.map((c, i) => (
            <article
              key={c.n}
              className={
                i === 0 ? "js-how-col lg:pr-12" : i === components.length - 1 ? "js-how-col lg:pl-12" : "js-how-col lg:px-12"
              }
            >
              <p className="js-how-num inline-block rounded-full border border-line bg-bg px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-primary">
                COMPONENT {c.n}
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold">{c.name}</h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{c.body}</p>
              <ul className="mt-7 flex flex-wrap gap-2">
                {c.specs.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-semibold text-ink"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
