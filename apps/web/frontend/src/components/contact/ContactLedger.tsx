"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";

export function ContactLedger({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        gsap.fromTo(
          q(".js-ledger-col"),
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: EASE,
            scrollTrigger: { trigger: root.current, start: "top 72%" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
      {children}
    </div>
  );
}
