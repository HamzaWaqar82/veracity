"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION } from "@/lib/motion";

export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.3,
            },
          },
        );
      });
    },
    { scope: bar },
  );

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="fixed inset-x-0 top-16 z-[60] h-0.5 origin-left bg-primary sm:top-[4.5rem]"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
