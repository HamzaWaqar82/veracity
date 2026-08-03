"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION, HOVER } from "@/lib/motion";

const interactive = "a, button, [role='button'], [data-cursor]";

export function CursorRing() {
  const ring = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
      if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
      const el = ring.current;
      if (!el) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
      const sTo = gsap.quickTo(el, "scale", { duration: 0.35, ease: "power3.out" });
      const oTo = gsap.quickTo(el, "opacity", { duration: 0.3, ease: "power2.out" });

      gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100, scale: 1, opacity: 0 });
      let visible = false;

      const onMove = (e: PointerEvent) => {
        if (!visible) {
          visible = true;
          oTo(1);
        }
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const onOver = (e: PointerEvent) => {
        const t = e.target as Element | null;
        if (t?.closest?.(interactive)) sTo(1.6);
      };
      const onOut = (e: PointerEvent) => {
        const t = e.target as Element | null;
        if (t?.closest?.(interactive)) sTo(1);
      };
      const onLeaveDoc = (e: MouseEvent) => {
        if (!e.relatedTarget) {
          visible = false;
          oTo(0);
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, true);
      window.addEventListener("pointerout", onOut, true);
      document.addEventListener("mouseout", onLeaveDoc);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver, true);
        window.removeEventListener("pointerout", onOut, true);
        document.removeEventListener("mouseout", onLeaveDoc);
      };
    });
  });

  return <div ref={ring} aria-hidden="true" className="cursor-ring" />;
}
