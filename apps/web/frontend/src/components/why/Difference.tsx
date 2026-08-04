"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon } from "@/components/icons";
import { personas, type PersonaId } from "./why-data";

const options: { id: PersonaId; label: string }[] = [
  { id: "everyone", label: "Everyone" },
  { id: "employees", label: "Employees" },
  { id: "managers", label: "Managers" },
  { id: "admins", label: "Administrators" },
];

type PersonaColumn = Exclude<PersonaId, "everyone">;

export function Difference() {
  const root = useRef<HTMLElement>(null);
  const [view, setView] = useState<PersonaId>("everyone");
  const buttonRefs = useRef<Partial<Record<PersonaId, HTMLButtonElement | null>>>({});
  const colRefs = useRef<Partial<Record<PersonaColumn, HTMLElement | null>>>({});
  const thumb = useRef<HTMLSpanElement>(null);
  const firstRun = useRef(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        q(".js-draw").forEach((path) => {
          const len = (path as unknown as SVGPathElement).getTotalLength();
          if (!len) return;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        tl.fromTo(
          q(".js-diff-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-diff-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-diff-toggle"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.35",
          )
          .fromTo(
            q(".js-diff-col"),
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, clearProps: "opacity,visibility" },
            "-=0.4",
          )
          .fromTo(
            q(".js-diff-row"),
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 },
            "-=0.55",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut", stagger: 0.05 }, "-=0.45");
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const btn = buttonRefs.current[view];
      const thumbEl = thumb.current;
      if (!btn || !thumbEl || !thumbEl.parentElement) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION }, () => {
        const wrapRect = thumbEl.parentElement!.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const targetX = btnRect.left - wrapRect.left;
        const targetW = btnRect.width;

        if (firstRun.current) {
          gsap.set(thumbEl, { x: targetX, width: targetW, autoAlpha: 1 });
          firstRun.current = false;
          return;
        }

        gsap.to(thumbEl, { x: targetX, width: targetW, duration: 0.45, ease: EASE, overwrite: "auto" });

        personas.forEach((persona) => {
          const col = colRefs.current[persona.id];
          if (!col) return;
          const emphasized = view === "everyone" || view === persona.id;
          if (!emphasized) return;
          const icons = col.querySelectorAll<SVGPathElement>(".js-draw");
          if (icons.length) {
            const lens = Array.from(icons).map((icon) => icon.getTotalLength());
            gsap.fromTo(
              icons,
              { strokeDashoffset: (i: number) => lens[i] || 0 },
              { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut", stagger: 0.06, overwrite: "auto" },
            );
          }
          gsap.fromTo(col, { y: 8 }, { y: 0, duration: 0.5, ease: EASE, overwrite: "auto" });
        });
      });
      return () => mm.revert();
    },
    { dependencies: [view] },
  );

  const handleKeyDown = (e: React.KeyboardEvent, id: PersonaId) => {
    const idx = options.findIndex((o) => o.id === id);
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    const nid = options[next].id;
    setView(nid);
    buttonRefs.current[nid]?.focus();
  };

  return (
    <section id="the-veracity-difference-in-practice" ref={root} className="scroll-mt-28 py-section">
      <div className="container-x">
        <h2 className="js-diff-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          The Veracity difference in practice.
        </h2>
        <p className="js-diff-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          One transparent platform, three perspectives. Every promise below stays on the page —
          the selector just focuses your attention on who you are.
        </p>

        <div
          role="radiogroup"
          aria-label="Choose your perspective"
          className="js-diff-toggle relative mt-10 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1"
        >
          <span
            ref={thumb}
            aria-hidden="true"
            className="js-diff-thumb absolute inset-y-1 left-0 z-0 hidden rounded-full bg-primary-soft opacity-0 lg:block"
          />
          {options.map((opt) => (
            <button
              key={opt.id}
              ref={(el) => {
                buttonRefs.current[opt.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={view === opt.id}
              tabIndex={view === opt.id ? 0 : -1}
              onClick={() => setView(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, opt.id)}
              className={
                "js-diff-btn relative z-10 shrink-0 rounded-full px-4 py-2 text-[0.875rem] font-semibold transition-colors duration-200 sm:px-5 " +
                (view === opt.id
                  ? "bg-primary-soft text-primary lg:bg-transparent"
                  : "text-muted hover:text-ink")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {personas.map((persona) => {
            const emphasized = view === "everyone" || view === persona.id;
            return (
              <article
                key={persona.id}
                ref={(el) => {
                  colRefs.current[persona.id] = el;
                }}
                className={
                  "js-diff-col scroll-mt-24 rounded-2xl border border-line bg-bg p-7 transition-opacity duration-500 sm:p-8 " +
                  (emphasized ? "opacity-100" : "opacity-40")
                }
              >
                <header className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-pine" />
                  <h3 className="font-display text-xl font-semibold">{persona.label}</h3>
                </header>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{persona.intro}</p>

                <ul className="mt-6 space-y-5">
                  {persona.points.map((point) => (
                    <li key={point.title} className="js-diff-row flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                      >
                        <CheckIcon pathClassName="js-draw" className="size-3" />
                      </span>
                      <div>
                        <h4 className="text-[0.9375rem] font-semibold text-ink">{point.title}</h4>
                        <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">{point.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {persona.quote && (
                  <blockquote className="js-diff-row mt-7 border-l-2 border-accent pl-4">
                    <p className="font-display text-[0.9375rem] italic leading-relaxed text-ink">
                      &ldquo;{persona.quote.text}&rdquo;
                    </p>
                    <footer className="mt-2 text-[0.8125rem] font-semibold text-muted">
                      — {persona.quote.attribution}
                    </footer>
                  </blockquote>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
