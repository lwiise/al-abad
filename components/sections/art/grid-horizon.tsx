"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { pauseOffscreen } from "@/components/motion/pause-offscreen";

const CELL = 44; // px — grid pitch, and therefore the exact loop distance

/**
 * A grid plane receding to a horizon — the 3D centrepiece for dark sections.
 *
 * Real CSS perspective on a `rotateX` plane, not a faked trapezoid image. The
 * plane is oversized and the lines repeat at a fixed pitch, so translating it by
 * exactly one cell loops seamlessly and forever: infinite forward travel from a
 * single transform, no repaint, no JS per frame.
 *
 * Reads as "the future" against `ink` / dark surfaces, which is where the AI
 * sections live.
 */
export function GridHorizon({
  className,
  tone = "violet",
}: {
  className?: string;
  /** Line colour. Kept to the two hues that survive a dark background. */
  tone?: "violet" | "teal";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const line = tone === "violet" ? "rgba(165,81,252,0.35)" : "rgba(13,103,139,0.4)";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Travel exactly one cell, then restart — visually continuous.
        const travel = gsap.fromTo(
          "[data-grid-plane]",
          { y: 0 },
          { y: CELL, duration: 2.6, ease: "none", repeat: -1 },
        );
        const stopPausing = pauseOffscreen(root, [travel]);
        return () => {
          stopPausing();
          travel.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ perspective: "340px", perspectiveOrigin: "50% 0%" }}
    >
      <div
        data-grid-plane
        className="absolute inset-x-[-50%] bottom-[-60%] top-[35%]"
        style={{
          transform: "rotateX(74deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `repeating-linear-gradient(to right, ${line} 0 1px, transparent 1px ${CELL}px),
                            repeating-linear-gradient(to bottom, ${line} 0 1px, transparent 1px ${CELL}px)`,
        }}
      />
      {/* Fade the far edge into the section so the plane has no hard top seam. */}
      <div className="absolute inset-x-0 top-[30%] h-40 bg-gradient-to-b from-ink to-transparent" />
    </div>
  );
}
