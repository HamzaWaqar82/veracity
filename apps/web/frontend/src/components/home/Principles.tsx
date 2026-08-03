"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, DESKTOP } from "@/lib/motion";

const principles = [
  {
    n: "01",
    title: "Data Minimization",
    body: "Veracity never logs keystrokes, records audio or video, or captures webcam or microphone data. Activity tracking covers application names, window titles, and URL domains at sixty-second heartbeat intervals — enough to understand work patterns, not enough to invade privacy. Screenshot capture is optional on Growth and Enterprise plans, at fixed intervals with client-side redaction and encryption. A deliberate architectural constraint at every tier, now and in all future versions.",
    chip: "A deliberate architectural constraint — every tier, now and always",
  },
  {
    n: "02",
    title: "Employee Visibility",
    body: "Every employee sees exactly what Veracity has collected about them in real time through a personal dashboard — the same data their manager sees. The Agent stays visible in the system tray with a live status indicator. Private Time pauses all capture with one click; only session duration is recorded. A complete access log shows who viewed their data and when. No data is hidden from employees.",
    chip: "The same data their manager sees — in real time",
  },
  {
    n: "03",
    title: "Compliance-First Design",
    body: "Veracity is built to comply with the General Data Protection Regulation (GDPR), the EU Artificial Intelligence Act, and US state electronic monitoring statutes including Connecticut General Statute §31-48d and New York Labor Law §52-c. Compliance tooling includes jurisdiction-aware notice engines, tamper-evident audit logging, configurable data retention with automated deletion, DSAR workflows, and DPIA support. We do not perform emotion recognition, biometric categorization, or any automated decision-making the AI Act restricts.",
    chip: "GDPR · EU AI Act · CT §31-48d · NY LL §52-c",
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
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-principles-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-principles-row"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 },
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

          // Barely-there idle float — rides alongside the scroll scrub (y px vs yPercent)
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
          Three Principles of Trustworthy Workforce Analytics
        </h2>
        <p className="js-principles-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The same constraints that protect employees are what make the analytics defensible, for
          managers and in front of regulators.
        </p>
        <div className="mt-14">
          {principles.map((p) => (
            <div key={p.n} className="js-principles-row grid gap-5 border-t border-line py-10 md:grid-cols-[5.5rem_1fr_auto] md:items-start md:gap-10">
              <p className="js-principles-num font-display text-3xl font-medium leading-none text-primary">
                {p.n}
              </p>
              <div>
                <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
                <p className="mt-4 max-w-[65ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                  {p.body}
                </p>
              </div>
              <p className="rounded-full bg-primary-soft px-4 py-2 text-[0.8125rem] font-semibold leading-snug text-primary md:mt-1 md:max-w-[15rem]">
                {p.chip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
