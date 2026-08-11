"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { CheckIcon, MinusIcon } from "@/components/icons";
import { TableScroll } from "@/components/common/TableScroll";
import { tiers, featureGroups, type TierCellValue, type TierCells } from "./pricing-data";

function CellValue({ value, iconClass = "" }: { value: TierCellValue; iconClass?: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center">
        <CheckIcon pathClassName={iconClass} className="size-5 text-primary" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === "no" || value === "not-available") {
    return (
      <span className="inline-flex items-center justify-center">
        <MinusIcon pathClassName={iconClass} className="size-5 text-accent" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span className="text-[0.9375rem] font-medium leading-snug tabular-nums">{value}</span>;
}

function MobileCardTable() {
  return (
    <div className="space-y-10">
      {featureGroups.map((group) => (
        <div key={group.id}>
          <h4 className="font-display text-xl font-semibold">{group.name}</h4>
          <div className="mt-5 space-y-5">
            {group.rows.map((row) => (
              <div key={row.feature} className="rounded-xl border border-line bg-bg">
                <p className="border-b border-line px-5 py-3.5 text-[0.9375rem] font-semibold leading-snug text-ink">
                  {row.feature}
                </p>
                <ul className="divide-y divide-line">
                  {tiers.map((tier, i) => (
                    <li key={tier.id} className="flex items-center gap-3 px-5 py-3">
                      <span
                        className="inline-flex w-24 shrink-0 items-center gap-1.5 text-[0.8125rem] font-semibold text-muted"
                        aria-hidden="true"
                      >
                        <span className="size-2 rounded-full bg-primary/50" />
                        {tier.name}
                      </span>
                      <span className="flex-1">
                        <CellValue value={row.cells[i]} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComparisonTable() {
  const root = useRef<HTMLElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        const matrix = matrixRef.current;
        if (matrix) {
          const mq = gsap.utils.selector(matrix);
          mq(".js-draw").forEach((path) => {
            const el = path as unknown as SVGPathElement;
            const len = el.getTotalLength();
            if (!len) return;
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
          });
        }

        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        tl.fromTo(
          q(".js-table-h"),
          { autoAlpha: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9 },
        )
          .fromTo(
            q(".js-table-matrix"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-table-group-row"),
            { autoAlpha: 0, x: -10 },
            { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08 },
            "-=0.35",
          )
          .fromTo(
            q(".js-table-row"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.03 },
            "-=0.3",
          )
          .to(
            q(".js-draw"),
            { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut", stagger: 0.02 },
            "-=0.55",
          )
          .fromTo(
            q(".js-table-mobile"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            "-=0.4",
          )
          .fromTo(
            q(".js-table-note"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.3",
          );
      });
    },
    { scope: root },
  );

  const handleHover = (e: React.MouseEvent<HTMLTableElement>) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-col]");
    setHovered(cell ? Number(cell.dataset.col) : null);
  };

  return (
    <section ref={root} id="plan-comparison-table" className="scroll-mt-28 py-section">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="js-table-h max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Every feature, every plan, in one table.
          </h2>
          <p className="js-table-h max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            All seven categories on one page. Cells are the published terms - nothing is settled
            after signup.
          </p>
        </div>

        <div ref={matrixRef} className="js-table-matrix mt-10 hidden lg:block">
          <TableScroll className="rounded-2xl border border-line bg-bg">
            <table
              className="w-full min-w-[960px] table-fixed border-separate border-spacing-0 text-left"
              onMouseOver={handleHover}
              onMouseLeave={() => setHovered(null)}
            >
              <thead>
                <tr className="sticky top-[4.5rem] z-10 bg-surface/95 backdrop-blur">
                  <th
                    scope="col"
                    className="sticky left-0 z-20 w-72 border-b border-r border-line bg-surface/95 px-6 py-5 align-bottom backdrop-blur"
                  >
                    <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      Feature
                    </span>
                  </th>
                  {tiers.map((tier, i) => (
                    <th
                      key={tier.id}
                      scope="col"
                      data-col={i}
                      className={`border-b border-line px-6 py-5 align-bottom transition-colors duration-200 ${
                        hovered === i ? "bg-primary-soft/40" : ""
                      }`}
                    >
                      <span className="block font-display text-lg font-semibold text-ink">
                        {tier.name}
                      </span>
                      <span className="mt-1 block text-sm font-medium tabular-nums text-primary">
                        {tier.monthly}
                        <span className="text-muted"> / user / mo</span>
                      </span>
                      <span className="mt-0.5 block text-[0.8125rem] text-muted">
                        {tier.users} · {tier.supportShort}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <GroupRows
                    key={group.id}
                    name={group.name}
                    groupRows={group.rows}
                    hovered={hovered}
                  />
                ))}
              </tbody>
            </table>
          </TableScroll>
        </div>

        <div className="js-table-mobile mt-10 lg:hidden">
          <MobileCardTable />
        </div>

        <p className="js-table-note mt-6 max-w-2xl text-[0.8125rem] leading-relaxed text-muted">
          The minus mark signals a capability a plan does not include - and no add-on can add it;
          upgrade tiers only. Every fact in this matrix is pulled from the published pricing terms on
          our site.
        </p>
      </div>
    </section>
  );
}

function GroupRows({
  name,
  groupRows,
  hovered,
}: {
  name: string;
  groupRows: { feature: string; cells: TierCells }[];
  hovered: number | null;
}) {
  return (
    <>
      <tr className="js-table-group-row bg-bg">
        <th
          scope="rowgroup"
          colSpan={4}
          className="border-b border-line bg-bg px-6 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted"
        >
          {name}
        </th>
      </tr>
      {groupRows.map((row) => (
        <tr key={row.feature} className="js-table-row group transition-colors hover:bg-surface/40">
          <th
            scope="row"
            className="sticky left-0 z-10 w-72 border-b border-r border-line bg-bg px-6 py-4 font-medium text-[0.9375rem] leading-snug text-ink group-hover:bg-surface/60"
          >
            {row.feature}
          </th>
          {row.cells.map((value, i) => (
            <td
              key={i}
              data-col={i}
              className={`border-b border-line px-6 py-4 transition-colors duration-200 ${
                hovered === i ? "bg-primary-soft/40" : ""
              }`}
            >
              <CellValue value={value} iconClass="js-draw" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
