"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Counts the leading number of a stat value up on scroll-in, preserving any
 * prefix/suffix ("+15"→counts to 15 keeping "+"; "100 ألف"→counts to 100 keeping
 * " ألف"; "آلاف" with no digits just shows as-is). SSRs the final value so it's
 * visible immediately (LCP-safe) and degrades cleanly under reduced motion.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/\d+/);
  const target = match ? parseInt(match[0], 10) : null;

  useGSAP(
    () => {
      if (target == null || !match || !ref.current) return;
      const token = match[0];
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
          onUpdate: () => {
            if (ref.current) ref.current.textContent = value.replace(token, String(Math.round(obj.v)));
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
