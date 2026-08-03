import { gsap } from "@/lib/motion";

export interface CursorLayer {
  el: HTMLElement;
  range: number;
}

export function attachLayerParallax(scope: HTMLElement, layers: CursorLayer[], chipEls: HTMLElement[]) {
  const xs = layers.map((t) => gsap.quickTo(t.el, "x", { duration: 0.9, ease: "power3.out" }));
  const ys = layers.map((t) => gsap.quickTo(t.el, "y", { duration: 0.9, ease: "power3.out" }));
  const cs = chipEls.map((c) => gsap.quickTo(c, "x", { duration: 0.7, ease: "power3.out" }));
  const onMove = (e: PointerEvent) => {
    const r = scope.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach((t, i) => {
      xs[i](-nx * t.range * 2);
      ys[i](-ny * t.range * 2);
    });
    chipEls.forEach((c, i) => cs[i](-nx * 60));
  };
  const onLeave = () => {
    xs.forEach((fn) => fn(0));
    ys.forEach((fn) => fn(0));
    cs.forEach((fn) => fn(0));
  };
  scope.addEventListener("pointermove", onMove);
  scope.addEventListener("pointerleave", onLeave);
  return () => {
    scope.removeEventListener("pointermove", onMove);
    scope.removeEventListener("pointerleave", onLeave);
  };
}

export function attachMagnetic(el: HTMLElement, radius = 140, strength = 0.4) {
  const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d >= radius) {
      xTo(0);
      yTo(0);
      return;
    }
    const f = Math.min(1, (radius - d) / radius) * strength;
    xTo(dx * f);
    yTo(dy * f);
  };
  document.addEventListener("pointermove", onMove);
  return () => document.removeEventListener("pointermove", onMove);
}

export function attachTilt(el: HTMLElement, maxAngle = 4, inner?: HTMLElement) {
  const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
  const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
  const ix = inner ? gsap.quickTo(inner, "x", { duration: 0.7, ease: "power3.out" }) : null;
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ry(nx * 2 * maxAngle);
    rx(-ny * 2 * maxAngle);
    if (ix) ix(-nx * 10);
  };
  const onLeave = () => {
    rx(0);
    ry(0);
    ix?.(0);
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
  };
}

export function attachNudge(el: HTMLElement, amount = 6) {
  const host = el.parentElement;
  if (!host) return () => {};
  const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    xTo(gsap.utils.clamp(-amount, amount, dx * 0.18));
  };
  const onLeave = () => xTo(0);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  return () => {
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
  };
}

export function attachSpotlight(el: HTMLElement) {
  const host = el.parentElement;
  if (!host) return () => {};
  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    xTo(e.clientX - r.left - r.width / 2);
    yTo(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  return () => {
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
  };
}
