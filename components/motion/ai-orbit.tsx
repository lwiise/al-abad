"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Decorative orbiting-dots accent for the AI section. Slowly rotates; dots
 * gently pulse. Desktop + no-reduced-motion only (static otherwise). aria-hidden.
 */
export function AiOrbit({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-orbit]", { rotate: 360, transformOrigin: "center", duration: 26, ease: "none", repeat: -1 });
        gsap.to("[data-orbit-rev]", { rotate: -360, transformOrigin: "center", duration: 34, ease: "none", repeat: -1 });
        gsap.to("[data-orbit-dot]", {
          scale: 1.6,
          transformOrigin: "center",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.3, from: "random" },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <g data-orbit>
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <circle data-orbit-dot cx="100" cy="20" r="4" fill="currentColor" />
        <circle data-orbit-dot cx="180" cy="100" r="3" fill="currentColor" />
      </g>
      <g data-orbit-rev>
        <circle cx="100" cy="100" r="54" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
        <circle data-orbit-dot cx="100" cy="46" r="3.5" fill="currentColor" />
        <circle data-orbit-dot cx="46" cy="100" r="3" fill="currentColor" />
      </g>
      <circle cx="100" cy="100" r="28" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      <circle data-orbit-dot cx="100" cy="100" r="5" fill="currentColor" />
    </svg>
  );
}
