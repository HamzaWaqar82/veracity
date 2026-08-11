"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import type { ArticleHeading } from "@/lib/blog";

export function ArticleToc({ headings }: { headings: ArticleHeading[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const linkEls = gsap.utils.toArray<HTMLElement>(".js-toc-link", root.current!);
      headings.forEach(({ id }) => {
        const anchor = document.getElementById(id);
        const linkEl = linkEls.find((l) => l.getAttribute("href") === `#${id}`);
        if (!anchor || !linkEl) return;
        ScrollTrigger.create({
          trigger: anchor,
          start: "top 35%",
          end: "bottom 35%",
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

  if (headings.length === 0) return null;

  return (
    <nav
      ref={root}
      aria-label="On this page"
      className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <p className="text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-muted">
        On this page
      </p>
      <ul className="mt-4 space-y-2.5 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="js-toc-link -ml-px block border-l border-transparent py-1 pl-4 text-[0.875rem] font-medium leading-snug text-muted transition-colors hover:border-primary/40 hover:text-ink"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
