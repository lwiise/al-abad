"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * How far a layer may drift, as a fraction of its own height.
 *
 * The ceiling is 0.25 and it is a real ceiling, not a suggestion. Parallax
 * fails in a specific, recognisable way: past about a quarter of the element's
 * height the layer visibly slides against its neighbours and the page stops
 * reading as a page and starts reading as a stack of sheets — the "cheap
 * template" version of the exact effect we are buying. Everything on this site
 * is between 0.06 and 0.18, which is felt as depth and never seen as sliding.
 */
const MAX = 0.25;

export type ParallaxOptions = {
  /**
   * Signed fraction of the element's height to travel. POSITIVE drifts the
   * layer DOWN as the page scrolls up — it lags the scroll, so it reads as
   * further away. Negative leads the scroll and reads as nearer.
   */
  speed?: number;
  /**
   * Which stretch of scrolling the drift is mapped onto. The two are not
   * interchangeable and picking the wrong one is visible on first paint.
   *
   * - `"pass"` (default) — the element's whole journey across the viewport,
   *   with the drift centred on ZERO at the moment the element is centred in
   *   the viewport. So the layer sits exactly where it was designed to sit at
   *   the one moment the reader is looking straight at it, and is displaced
   *   only on the way in and on the way out. Correct for anything below the
   *   fold.
   *
   * - `"exit"` — anchored to the top of the document instead: the element
   *   starts at REST and drifts only as it leaves upward. This is the one
   *   above-the-fold elements need, and the reason the option exists. Under
   *   `"pass"` an element that is already on screen at scroll 0 is already
   *   most of the way through its journey, so it would render visibly
   *   displaced from where CSS put it before the reader has scrolled at all —
   *   the hero would load crooked.
   */
  mode?: "pass" | "exit";
  /** Scale at the start, easing to 1 at the end. 1 = no scaling. */
  from?: number;
  /** Only run at or above this width, in px. Depth on a phone is wasted. */
  minWidth?: number;
};

/**
 * Scroll-linked drift — the axis this site did not have.
 *
 * Every one of the 34 scroll entrances already here is a THRESHOLD: an
 * IntersectionObserver crosses a line, a class flips, a 560ms transition plays
 * to completion and is never heard from again. That is a fine way to introduce
 * an element and a bad way to make a page feel alive, because nothing on the
 * page is aware of the scroll itself — only of having been passed. A reader who
 * scrolls slowly, stops, or scrolls back up sees exactly the same thing as one
 * who flicked past, which is to say: nothing.
 *
 * This is the other half. `scrub` ties an element's transform to scroll
 * POSITION, so the page answers continuously and in both directions. Used on
 * decorative and figurative layers only — never on a block of text, which must
 * hold still to be read, and never on anything that would then be out of place
 * if the reader stopped mid-drift.
 *
 * `scrub: 0.6` rather than `true`: a hard scrub maps the transform to the raw
 * scroll position, which on a trackpad flick is jittery even with Lenis
 * interpolating, because the two are then interpolating the same input twice.
 * 0.6s of catch-up lets the layer settle into its position instead of tracking
 * every tick of it — the same value Trionn uses on its pinned sections.
 *
 * Reduced motion, and narrow viewports, get nothing at all — not a smaller
 * drift, none — so the element renders exactly where CSS put it.
 */
export function useParallax<T extends HTMLElement>({
  speed = 0.12,
  mode = "pass",
  from = 1,
  minWidth = 768,
}: ParallaxOptions = {}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`(min-width: ${minWidth}px) and (prefers-reduced-motion: no-preference)`, () => {
        const distance = gsap.utils.clamp(-MAX, MAX, speed);
        const exit = mode === "exit";

        const tween = gsap.fromTo(
          el,
          // "exit" starts at rest — the element is already on screen and must
          // render exactly where CSS put it until the reader moves.
          { yPercent: exit ? 0 : (-distance * 100) / 2, scale: from },
          {
            yPercent: exit ? distance * 100 : (distance * 100) / 2,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              // "pass": the element's top touching the bottom of the viewport
              // through to its bottom touching the top.
              //
              // "exit": scroll position ZERO — a literal 0, not `"top top"`.
              // An above-the-fold element usually starts some way down the
              // page, so `"top top"` would not fire until the reader had
              // already scrolled past that offset, leaving the layer inert for
              // the first few hundred pixels and then starting abruptly. Pinned
              // to 0 the drift begins on the first notch of the wheel, which is
              // the whole point of the mode.
              start: exit ? 0 : "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
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
