"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Gentle float for the chips scattered around section 7's mockup.
 *
 * A pass-through wrapper: its children are rendered on the SERVER and handed
 * in, so nothing here grows the client bundle beyond this file — and gsap is
 * already on the homepage for AiOrbit in the final CTA.
 *
 * Desktop + no-reduced-motion only. Below xl the chips are a plain wrapped list
 * with nothing to float — bobbing the members of a flow row by different amounts
 * just breaks its baseline — which is why the query matches the same breakpoint
 * the scatter starts at; under reduced motion the matchMedia block never runs
 * and every chip sits exactly where CSS put it.
 *
 * GSAP writes `transform`. The chips' tilt is on the standalone `rotate`
 * property, which Tailwind v4 emits separately — two channels, one owner each.
 */
export function FloatGroup({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1280px)", () => {
        gsap.to("[data-float]", {
          y: 9,
          duration: 3.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: "random" },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
