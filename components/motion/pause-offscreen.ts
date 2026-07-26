"use client";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Pauses looping tweens while their section is off screen.
 *
 * Infinite tweens (drifting orbs, floating dots, orbits) otherwise burn CPU for
 * the entire session, on every section, whether or not anyone can see them.
 * With a dozen ambient scenes across the site that is the difference between
 * "alive" and "the fan spins up". Every `repeat: -1` tween in this codebase
 * should be registered here.
 *
 * Returns a cleanup that kills the observer — call it from the matchMedia
 * cleanup that owns the tweens.
 */
export function pauseOffscreen(
  trigger: Element | null,
  tweens: Array<gsap.core.Tween | gsap.core.Timeline | undefined>,
): () => void {
  if (!trigger) return () => {};
  const live = tweens.filter(Boolean) as Array<gsap.core.Tween | gsap.core.Timeline>;
  if (!live.length) return () => {};

  const st = ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      for (const t of live) {
        if (self.isActive) t.resume();
        else t.pause();
      }
    },
  });

  // ScrollTrigger only fires onToggle on a *change*, so a section that starts
  // off screen would keep running until first scrolled past. Set the initial
  // state explicitly.
  if (!st.isActive) for (const t of live) t.pause();

  return () => st.kill();
}
