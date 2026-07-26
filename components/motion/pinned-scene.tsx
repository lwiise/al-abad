"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Holds a section still while the page keeps scrolling, running a scrubbed
 * timeline over that held time. The one genuinely cinematic move in the kit —
 * used sparingly, on at most a couple of sections.
 *
 * Desktop only, deliberately. Pinning on touch devices fights the browser's own
 * scroll handling, breaks address-bar collapse, and is the most common source
 * of janky "premium" sites. Below 1024px — and under reduced motion — this is
 * an ordinary section that scrolls past normally, with all content visible.
 */
export function PinnedScene({
  className,
  /** Extra scroll distance the section stays pinned for. */
  distance = "+=80%",
  build,
  children,
}: {
  className?: string;
  distance?: string;
  build?: (tl: gsap.core.Timeline, root: HTMLElement) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: distance,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });
        build?.(tl, el);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
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
