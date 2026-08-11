"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";

const principles = [
  {
    n: "01",
    title: "Transparency by default",
    body: "Every employee sees exactly what Veracity has collected about them in real time through a personal dashboard with the same data their manager sees. The Agent stays visible in the system tray with a live status indicator. There is no stealth mode, no hidden capture, and no data collected without the employee's knowledge. A complete access log shows who viewed their data and when.",
    chip: "The same data their manager sees, in real time",
  },
  {
    n: "02",
    title: "Privacy as a feature",
    body: "We collect only what is necessary for productivity analytics: application usage, window titles, and URL domains, with periodic screenshots only on the plans that include them. We do not log keystrokes, record continuously, or capture audio or video. Screenshots are encrypted at the point of capture and redacted by default.",
    chip: "Keystrokes, audio, and video are never collected",
  },
  {
    n: "03",
    title: "Data minimization",
    body: "Activity tracking runs on a sixty-second heartbeat cycle, not a continuous stream. We capture state, not recordings. Screenshot capture is optional on Growth and Enterprise plans, at fixed intervals with client-side redaction and encryption. Retention is configurable with automated deletion, and Private Time pauses all capture with one click - only session duration is recorded.",
    chip: "A deliberate architectural constraint at every tier, now and always",
  },
  {
    n: "04",
    title: "Human-in-the-loop accountability",
    body: "No automated decisions affect employment outcomes. Productivity scores are advisory tools for coaching conversations, not performance evaluations. Screenshots require an explicit manager request to view - no automatic flagging or alerts based on screen content - and every access to monitoring data is logged in a tamper-evident audit trail.",
    chip: "Scores advise; managers decide",
  },
  {
    n: "05",
    title: "Compliance-First Design",
    body: "Veracity is built to comply with the General Data Protection Regulation (GDPR), the EU Artificial Intelligence Act, and US state electronic monitoring statutes including Connecticut General Statute §31-48d, New York Labor Law §52-c, Delaware Title 19 §705, and Colorado Revised Statute §8-2-127. Compliance tooling includes jurisdiction-aware notice engines, tamper-evident audit logging, configurable data retention with automated deletion, DSAR workflows, and DPIA support. We do not perform emotion recognition, biometric categorization, or any automated decision-making the AI Act restricts.",
    chip: "GDPR · EU AI Act · CT · NY · DE · CO",
  },
];

export function Principles() {
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
          q(".js-principles-h"),
          { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-principles-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-principles-row"),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
            "-=0.2",
          );

        if (desktop) {
          q(".js-principles-num").forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: 26 },
              {
                yPercent: -26,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.6,
                },
              },
            );
          });

          // Barely-there idle float - rides alongside the scroll scrub (y px vs yPercent)
          gsap.to(q(".js-principles-num"), {
            y: 4,
            duration: 2.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: 0.4,
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section">
      <div className="container-x">
        <h2 className="js-principles-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Five Principles of Trustworthy Workforce Analytics
        </h2>
        <p className="js-principles-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The same constraints that protect employees are what make the analytics defensible, for
          managers and in front of regulators.
        </p>
        <div className="mt-14">
          {principles.map((p) => (
            <div key={p.n} className="js-principles-row grid gap-5 border-t border-line py-10 md:grid-cols-[8.5rem_1fr] md:gap-x-10">
              <p className="js-principles-num mt-1 inline-block w-fit max-w-full self-start rounded-full border border-line bg-bg px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-primary">
                PRINCIPLE {p.n}
              </p>
              <div>
                <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-4 max-w-[65ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                  {p.body}
                </p>
              </div>
              <p className="w-fit max-w-full rounded-full bg-primary-soft px-4 py-2 text-[0.8125rem] font-semibold leading-snug text-primary md:col-start-2">
                {p.chip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
