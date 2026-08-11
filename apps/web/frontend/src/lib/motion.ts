import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// design.json motion tokens: ease-out-quint is the default easing for state
// transitions and entrance reveals; reveal-entrance is 700ms.
export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export const MOTION = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 1024px)";
export const HOVER = "(hover: hover) and (pointer: fine)";

// Standard scroll-triggered section reveal (y: 24 -> 0, 700ms). Pass straight
// to gsap.fromTo(el, REVEAL.from, REVEAL.to) for generic heading/lead entrances.
export const REVEAL = {
  from: { autoAlpha: 0, y: 24 } as gsap.TweenVars,
  to: { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE } as gsap.TweenVars,
};

export { gsap, ScrollTrigger, useGSAP };
