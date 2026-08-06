"use client";

import { useRef } from "react";
import { gsap, useGSAP, EASE, MOTION } from "@/lib/motion";
import { availability } from "@/components/about/about-data";
import { SupportChannelsCard } from "./SupportChannelsCard";
import { DemoCard } from "./DemoCard";

export function ContactSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add({ motion: MOTION }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const enter = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        enter
          .fromTo(q(".js-contact-h"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 })
          .fromTo(
            q(".js-contact-lead"),
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "-=0.4",
          )
          .fromTo(
            q(".js-contact-col"),
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.5",
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className="scroll-mt-28 border-t border-line bg-white py-section">
      <div className="container-x">
        <h2 className="js-contact-h max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Talk to us.
        </h2>
        <p className="js-contact-lead mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A question about Veracity, a demo request, or help with your account — the team is here
          to help. {availability}
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="js-contact-col">
            <SupportChannelsCard />
          </div>
          <div className="js-contact-col">
            <DemoCard />
          </div>
        </div>
      </div>
    </section>
  );
}
