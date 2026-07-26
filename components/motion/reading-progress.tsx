"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

/**
 * Hairline progress bar for long-form article pages.
 *
 * Fills from the RIGHT edge — `transform-origin: 100% 50%` — because that is
 * where an Arabic reader starts. Percentages are physical, not logical, so this
 * is correct precisely *because* it is hard-coded to the right.
 *
 * Purely decorative (aria-hidden): under reduced motion it never grows, and a
 * reader loses nothing. Drives a single `scaleX`, so it never touches layout.
 */
export function ReadingProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scaleTo = gsap.quickTo(el, "scaleX", { duration: 0.25, ease: "power2" });
        const st = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => scaleTo(self.progress),
        });
        return () => st.kill();
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      aria-hidden="true"
      className={className ?? "pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]"}
    >
      <div
        ref={ref}
        className="h-full w-full origin-[100%_50%] scale-x-0 bg-gradient-to-l from-primary via-highlight to-secondary"
      />
    </div>
  );
}
