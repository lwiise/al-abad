"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scroll-triggered entrance (fade + gentle rise, once) powered by GSAP
 * ScrollTrigger. Same API as before so all section usages are unchanged.
 * Honors prefers-reduced-motion via gsap.matchMedia (content stays visible).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          opacity: 0,
          y: 16,
          duration: 0.7,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
