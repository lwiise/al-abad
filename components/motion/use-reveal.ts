"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

// Layout effect on the client (runs before paint → no flash of
// visible-then-hidden); plain effect on the server so SSR doesn't warn that
// useLayoutEffect does nothing.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Reveal-on-scroll via IntersectionObserver + CSS transitions.
 *
 * The element renders VISIBLE (no attribute) in SSR/initial render. Only after
 * this effect confirms IO is available and motion is allowed does it add
 * `<attr>="hidden"` (before paint), then flip to `"shown"` on first intersect
 * and stop observing. Every failure path — no JS, no IO, reduced motion, slow
 * hydration — leaves content fully visible. No scroll-position math, no
 * once-miss, no refresh-timing dependency.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  options?: { attr?: string; prepare?: (el: HTMLElement) => void },
) {
  const attr = options?.attr ?? "data-reveal";
  const prepare = options?.prepare;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Capability / preference guards → stay visible.
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    prepare?.(el);
    el.setAttribute(attr, "hidden");

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute(attr, "shown");
            obs.disconnect(); // once
            return;
          }
        }
      },
      // threshold 0 (never fractional) so elements taller than the viewport
      // still fire; the negative bottom margin reveals slightly before the
      // element is fully in view, mirroring the old "top ~85%" trigger line.
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
    // Set up once: section content is server-rendered and static per mount.
  }, []);
}
