"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

export type JumpLink = { label: string; href: string };

export function SectionJumpNav({
  links,
  ariaLabel,
}: {
  links: JumpLink[];
  ariaLabel: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const linkEls = gsap.utils.toArray<HTMLElement>(".js-jump-link", root.current!);
      links.forEach(({ href }) => {
        const anchor = document.getElementById(href.slice(1));
        const linkEl = linkEls.find((l) => l.getAttribute("href") === href);
        if (!anchor || !linkEl) return;
        const trigger = anchor.closest("section") ?? anchor;
        ScrollTrigger.create({
          trigger,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) {
              linkEl.classList.add("is-active");
              linkEl.setAttribute("aria-current", "true");
            } else {
              linkEl.classList.remove("is-active");
              linkEl.removeAttribute("aria-current");
            }
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <nav
      ref={root}
      aria-label={ariaLabel}
      className="mx-auto inline-flex max-w-full items-center overflow-hidden rounded-full border border-hero-line/70 bg-white/30 backdrop-blur-sm"
    >
      <span className="hidden py-2.5 pl-5 pr-3 text-[0.8125rem] font-semibold text-hero-muted sm:block">
        Jump to
      </span>
      <div className="flex flex-wrap justify-center divide-x divide-hero-line/70 sm:flex-nowrap">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="js-jump-link px-4 py-2.5 text-[0.8125rem] font-semibold text-hero-ink transition-colors hover:bg-white/50 sm:px-6"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
