"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { team } from "./about-data";

export function Team() {
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
          .fromTo(q(".js-team-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-team-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-team-row"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="scroll-mt-28 border-t border-line bg-surface py-section">
      <div className="container-x">
        <h2 className="js-team-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The people behind the promise.
        </h2>
        <p className="js-team-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A small, fully remote team across North America and Europe - the same people who answer
          your emails, run your audits, and build the Agent.
        </p>

        <div className="js-team-card mt-12 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
            <p className="text-xs font-bold tracking-[0.16em] text-on-dark">TEAM ROSTER</p>
            <p className="text-xs font-semibold text-on-dark-muted">FOUNDING TEAM</p>
          </div>
          <div className="divide-y divide-line">
            {team.map((member) => (
              <div
                key={member.name}
                className="js-team-row grid gap-2 px-5 py-7 transition-colors duration-300 hover:bg-surface sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-8 sm:px-8"
              >
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-primary">
                    {member.role}
                  </p>
                </div>
                <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
