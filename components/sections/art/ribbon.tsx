"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";

// Two hand-tuned paths so consecutive ribbons on one page don't rhyme.
const PATHS = [
  "M 0 60 C 220 4, 420 4, 640 56 S 1080 116, 1440 44",
  "M 0 40 C 260 108, 500 108, 720 48 S 1140 -8, 1440 72",
];

/**
 * A brand ribbon that draws itself as you scroll past — used to join two
 * sections instead of leaving a hard colour seam between them.
 *
 * The draw is *scrubbed*, not fired once: the line grows and retreats with
 * scroll position, so it stays alive the whole time it is on screen. That
 * continuous response is the main thing separating this pass from the one-shot
 * fades already in the codebase.
 *
 * `DrawSVGPlugin` is already registered in `lib/gsap.ts`.
 */
export function Ribbon({
  className,
  variant = 0,
  flip = false,
}: {
  className?: string;
  variant?: 0 | 1;
  /** Mirror vertically — lets a pair of ribbons cradle a section. */
  flip?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.fromTo(
          "[data-ribbon-path]",
          { drawSVG: "50% 50%" },
          {
            drawSVG: "0% 100%",
            ease: "none",
            stagger: 0.12,
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      fill="none"
      className={cn("pointer-events-none absolute inset-x-0 h-24 w-full", className)}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={`ribbon-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d678b" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#a551fc" stopOpacity="0.55" />
          <stop offset="1" stopColor="#583b66" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        data-ribbon-path
        d={PATHS[variant]}
        stroke={`url(#ribbon-${variant})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        data-ribbon-path
        d={PATHS[variant === 0 ? 1 : 0]}
        stroke={`url(#ribbon-${variant})`}
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
    </svg>
  );
}
