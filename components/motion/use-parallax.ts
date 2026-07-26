"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scroll-scrubbed vertical parallax. `depth` is roughly the fraction of the
 * element's own height it travels while its trigger crosses the viewport: 0.15
 * drifts, 0.5 moves hard. Positive values lag behind the scroll (the layer
 * recedes); negative values lead it (the layer comes forward).
 *
 * Y axis only. Horizontal translation inverts meaning under RTL, so it is never
 * used in this codebase — depth is carried by Y, scale and Z instead.
 *
 * Gated to desktop + no-reduced-motion. Everywhere else the element simply
 * stays where the layout put it, so nothing depends on this running.
 */
export function useParallax<T extends HTMLElement>(
  depth = 0.25,
  options?: {
    /** Element whose scroll range drives the motion. Defaults to the element itself. */
    trigger?: RefObject<HTMLElement | null>;
    /** Min viewport width to run at. Defaults to 768 — parallax on phones costs more than it gives. */
    minWidth?: number;
  },
) {
  const ref = useRef<T>(null);
  const minWidth = options?.minWidth ?? 768;
  const triggerRef = options?.trigger;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(`(min-width: ${minWidth}px) and (prefers-reduced-motion: no-preference)`, () => {
        const travel = depth * 50;
        const tween = gsap.fromTo(
          el,
          { yPercent: -travel },
          {
            yPercent: travel,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: triggerRef?.current ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(el, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
