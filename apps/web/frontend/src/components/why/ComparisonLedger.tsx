"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, EASE, MOTION, DESKTOP, HOVER } from "@/lib/motion";
import { attachSpotlight, attachTilt } from "@/lib/cursor";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { TableScroll } from "@/components/common/TableScroll";
import { comparisonRows } from "./why-data";

export function ComparisonLedger() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const spotlight = useRef<HTMLDivElement>(null);
  const ping = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add({ motion: MOTION, desktop: DESKTOP }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.desktop) return;

        q(".js-draw").forEach((path) => {
          const el = path as unknown as SVGPathElement;
          const len = el.getTotalLength();
          if (!len) return;
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        });

        if (ping.current) {
          gsap.fromTo(
            ping.current,
            { scale: 1, opacity: 0.7 },
            { scale: 3.4, opacity: 0, duration: 2.4, ease: "power1.out", repeat: -1, delay: 1.2 },
          );
        }

        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        enter
          .fromTo(
            q(".js-ledger-h"),
            { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
            { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
          )
          .fromTo(
            q(".js-ledger-lead"),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            card.current,
            { opacity: 0, y: 34, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.95 },
            "-=0.45",
          )
          .fromTo(
            q(".js-ledger-row"),
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.045 },
            "-=0.55",
          )
          .to(q(".js-draw"), { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut", stagger: 0.03 }, "-=0.4")
          .fromTo(
            q(".js-ledger-stamp"),
            { opacity: 0, scale: 0.7, rotation: -14 },
            { opacity: 1, scale: 1, rotation: 0, duration: 0.5 },
            "-=0.5",
          );
      });

      mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
        if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
        if (spotlight.current && card.current) {
          const cleanups = [
            attachSpotlight(spotlight.current),
            attachTilt(card.current, 2),
          ];
          return () => cleanups.forEach((fn) => fn());
        }
      });
    },
    { scope: root },
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    const heading = el.querySelector<HTMLElement>(".js-ledger-h");
    if (!heading) return;
    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION }, () => {
      gsap.fromTo(
        heading,
        { backgroundColor: "oklch(0.938 0.042 150 / 0.85)" },
        { backgroundColor: "oklch(0.938 0.042 150 / 0)", duration: 2.4, ease: "power2.out", delay: 0.5 },
      );
    });
    return () => mm.revert();
  }, []);

  const handleHover = (e: React.MouseEvent<HTMLTableElement>) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-col]");
    setHovered(cell ? Number(cell.dataset.col) : null);
  };

  return (
    <section
      id="comparison-with-traditional-monitoring-tools"
      ref={root}
      className="scroll-mt-28 border-y border-line bg-surface py-section"
    >
      <div className="container-x">
        <h2 className="js-ledger-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Side by side with the traditional tools.
        </h2>
        <p className="js-ledger-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Twelve dimensions, stated as facts. Green marks what Veracity does and captures; teal
          marks what it never does - architectural refusals that apply at every tier.
        </p>

        <div className="relative mt-12 [perspective:1400px]">
          <div
            ref={card}
            className="js-ledger-card relative overflow-hidden rounded-2xl border border-line bg-white"
          >
            <div
              ref={spotlight}
              aria-hidden="true"
              className="approach-spotlight pointer-events-none absolute"
              style={{
                left: "50%",
                top: "50%",
                width: "42rem",
                height: "42rem",
                marginLeft: "-21rem",
                marginTop: "-21rem",
              }}
            />
            <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-on-dark">
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 rounded-full bg-state-active" />
                  <span
                    ref={ping}
                    className="absolute inset-0 rounded-full border border-state-active"
                  />
                </span>
                COMPARISON LEDGER
              </p>
              <p className="text-xs font-semibold text-on-dark-muted">TRADITIONAL TOOLS → VERACITY</p>
            </div>

            <TableScroll hint={false}>
              <table
                className="w-full min-w-[46rem] border-collapse text-left"
                onMouseOver={handleHover}
                onMouseLeave={() => setHovered(null)}
              >
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="px-6 py-4 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Dimension
                    </th>
                    <th
                      scope="col"
                      data-col={1}
                      className={`px-6 py-4 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted transition-colors duration-200 ${
                        hovered === 1 ? "bg-surface/50" : ""
                      }`}
                    >
                      Traditional Tools
                    </th>
                    <th
                      scope="col"
                      data-col={2}
                      className={`px-6 py-4 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 ${
                        hovered === 2 ? "bg-primary-soft/50" : ""
                      }`}
                    >
                      Veracity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.dimension} className="js-ledger-row group border-b border-line last:border-b-0">
                      <th scope="row" className="w-[11rem] px-6 py-5 align-top text-[0.9375rem] font-semibold text-ink">
                        {row.dimension}
                      </th>
                      <td
                        data-col={1}
                        className={`js-ledger-dim px-6 py-5 align-top text-[0.9375rem] leading-relaxed text-muted transition-colors duration-200 ${
                          hovered === 1 ? "bg-surface/50" : "group-hover:bg-surface/30"
                        }`}
                      >
                        {row.traditional}
                      </td>
                      <td
                        data-col={2}
                        className={`js-ledger-val js-ledger-val-cell px-6 py-5 align-top transition-colors duration-200 ${
                          hovered === 2 ? "bg-primary-soft/50" : "group-hover:bg-primary-soft/30"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className={
                              row.voice === "affirms"
                                ? "js-ledger-chip flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                                : "js-ledger-chip flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
                            }
                          >
                            {row.voice === "affirms" ? (
                              <CheckIcon pathClassName="js-draw" className="size-3" />
                            ) : (
                              <MinusIcon pathClassName="js-draw" className="size-3" />
                            )}
                          </span>
                          <span
                            className={
                              row.voice === "affirms"
                                ? "text-[0.9375rem] leading-relaxed text-ink"
                                : "text-[0.9375rem] leading-relaxed text-accent"
                            }
                          >
                            {row.veracity}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>

            <div className="js-ledger-stamp flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-primary-soft px-5 py-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-primary">
                  <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-primary text-white">
                    <CheckIcon className="size-2.5" />
                  </span>
                  Capture-affirming
                </p>
                <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-accent">
                  <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
                    <MinusIcon className="size-2.5" />
                  </span>
                  Never - architectural constraint
                </p>
              </div>
              <p className="text-[0.8125rem] font-semibold text-primary">No accuracy % claims, anywhere</p>
            </div>
          </div>

          <p className="mt-4 text-center text-sm font-medium text-muted lg:hidden">
            Scroll sideways to compare all twelve dimensions.
          </p>
        </div>
      </div>
    </section>
  );
}
