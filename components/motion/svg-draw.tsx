"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Draws its `[data-draw]` child paths on scroll-in (DrawSVG). Reduced-motion →
 * paths stay fully drawn. Decorative; pass aria-hidden content.
 */
export function SvgDraw({
  children,
  className,
  viewBox,
  preserveAspectRatio,
}: {
  children: ReactNode;
  className?: string;
  viewBox: string;
  preserveAspectRatio?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const paths = ref.current?.querySelectorAll("[data-draw]");
        if (!paths || paths.length === 0) return;
        gsap.from(paths, {
          drawSVG: "0%",
          duration: 1.3,
          ease: "power2.inOut",
          stagger: 0.2,
          scrollTrigger: { trigger: ref.current, start: "clamp(top 80%)", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
