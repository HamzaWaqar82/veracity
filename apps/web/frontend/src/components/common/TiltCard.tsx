"use client";

import { useCallback, useRef, type ReactNode, type Ref } from "react";
import { gsap, useGSAP, MOTION, HOVER } from "@/lib/motion";
import { attachSpotlight, attachTilt } from "@/lib/cursor";

/**
 * Shared pointer-reactive card: 3D tilt + pine spotlight on hover,
 * gated to motion-OK + fine-pointer (matches the ComparisonLedger reference).
 * Drop the visual card classes here; wrap it in an element that keeps the
 * `[perspective:1400px]` and any entrance-timeline classes.
 */
export function TiltCard({
  children,
  className = "",
  maxAngle = 2,
  spotlight = true,
  ref,
}: {
  children: ReactNode;
  className?: string;
  maxAngle?: number;
  spotlight?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  const card = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  const setCardRef = useCallback(
    (el: HTMLDivElement | null) => {
      card.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
    },
    [ref],
  );

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION, hover: HOVER }, (ctx) => {
      if (!ctx.conditions?.motion || !ctx.conditions?.hover) return;
      const cleanups: (() => void)[] = [];
      if (card.current) cleanups.push(attachTilt(card.current, maxAngle));
      if (spotlight && spot.current) cleanups.push(attachSpotlight(spot.current));
      return () => cleanups.forEach((fn) => fn());
    });
  });

  return (
    <div ref={setCardRef} className={`relative overflow-hidden ${className}`}>
      {spotlight && (
        <div
          ref={spot}
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
      )}
      {children}
    </div>
  );
}
