"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION, HOVER } from "@/lib/motion";
import { attachTilt } from "@/lib/cursor";

const states = [
  {
    name: "ACTIVE",
    color: "oklch(0.706 0.118 161)",
    noteColor: "oklch(0.476 0.078 162)",
    desc: "The employee is actively using the workstation: keyboard or mouse input detected within the idle threshold (default: 180 seconds of inactivity).",
    note: "Idle threshold: 180 seconds",
  },
  {
    name: "PASSIVE",
    color: "oklch(0.55 0.11 225)",
    noteColor: "oklch(0.43 0.095 225)",
    desc: "The employee is engaged but not inputting: reading a document, watching a training video, or in a meeting. Passive attention is detected via calendar integration (Google Calendar, Outlook) or heuristic window analysis.",
    note: "Calendar + heuristic detection",
  },
  {
    name: "IDLE",
    color: "oklch(0.49 0.03 160)",
    noteColor: "oklch(0.4 0.03 160)",
    desc: "Away from the workstation, with no input beyond the idle threshold. Idle time is never penalized in productivity scoring; it is excluded from calculations entirely.",
    note: "Excluded from scoring, entirely",
  },
  {
    name: "PRIVATE_TIME",
    color: "oklch(0.62 0.12 82)",
    noteColor: "oklch(0.48 0.12 82)",
    desc: "Employee-activated Private Time. All capture is suppressed except session duration tracking. Heartbeats continue during Private Time, reporting the PRIVATE_TIME state.",
    note: "Duration only · enforced even offline",
  },
];

export function States() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

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
          q(".js-states-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-states-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          );

        if (grid.current) {
          const cells = gsap.utils.toArray<HTMLElement>(".js-states-cell", grid.current);
          if (cells.length) {
            gsap.fromTo(
              cells,
              { autoAlpha: 0, y: 46 },
              {
                autoAlpha: 1,
                y: 0,
                ease: "none",
                stagger: 0.12,
                scrollTrigger: {
                  trigger: grid.current,
                  start: "top 82%",
                  end: "top 32%",
                  scrub: 0.8,
                },
              },
            );
          }
        }
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        const cleanups: (() => void)[] = [];
        gsap.utils.toArray<HTMLElement>(".js-states-cell", grid.current ?? root.current!).forEach((cell) => {
          const inner = cell.querySelector<HTMLElement>(".js-tilt-inner");
          cleanups.push(attachTilt(cell, 4, inner ?? undefined));
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="py-section-sm">
      <div className="container-x">
        <h2 className="js-states-h font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          What the Analytics Actually Measures
        </h2>
        <p className="js-states-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every minute of captured activity is labeled honestly. No hidden categories, no
          guesswork about what counts as work.
        </p>
        <div
          ref={grid}
          className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 [perspective:1200px]"
        >
          {states.map((s) => (
            <div key={s.name} className="js-states-cell bg-bg p-7 sm:p-9">
              <div className="js-tilt-inner">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <h3 className="text-[0.8125rem] font-bold tracking-[0.16em]">{s.name}</h3>
                </div>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{s.desc}</p>
                <p className="mt-5 text-[0.9375rem] font-semibold" style={{ color: s.noteColor }}>
                  {s.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
