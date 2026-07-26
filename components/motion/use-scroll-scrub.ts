"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Binds a timeline to scroll position, so the animation plays *as you scroll*
 * rather than firing once on entry. This is the difference between a section
 * that announces itself and one that stays alive the whole time it is on
 * screen — the main lever this pass uses to replace one-shot fades.
 *
 * `build` receives an empty timeline to populate; it runs inside a
 * `gsap.matchMedia` scope, so everything it creates is reverted automatically
 * when the query stops matching or the component unmounts.
 *
 * Returns a ref to attach to the section that drives the scroll range.
 */
export function useScrollScrub<T extends HTMLElement>(
  build: (tl: gsap.core.Timeline) => void,
  options?: {
    start?: string;
    end?: string;
    /** Seconds of smoothing; `true` snaps directly to scroll position. */
    scrub?: number | boolean;
    minWidth?: number;
  },
) {
  const ref = useRef<T>(null);
  const start = options?.start ?? "top bottom";
  const end = options?.end ?? "bottom top";
  const scrub = options?.scrub ?? 0.6;
  const minWidth = options?.minWidth ?? 0;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const query = minWidth
        ? `(min-width: ${minWidth}px) and (prefers-reduced-motion: no-preference)`
        : "(prefers-reduced-motion: no-preference)";

      mm.add(query, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start, end, scrub },
        });
        build(tl);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
