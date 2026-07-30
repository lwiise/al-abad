"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Duration of the scroll interpolation, in seconds — how long the page takes to
 * catch up to where the wheel already put it.
 *
 * Lenis ships 1.2. That is tuned for a studio reel where the scroll IS the
 * content; here it overshoots every anchor and makes the FAQ feel like it is
 * resisting the reader. 1.05 keeps the weight — the thing that reads as
 * expensive — without the page ever feeling like it is arguing.
 *
 * The ceiling is set by the shortest useful gesture: one wheel notch is ~100px,
 * and past ~1.2s a single notch is still visibly moving when the next one
 * arrives, which compounds into the "swimming" feel people mean when they say
 * they hate smooth scroll.
 */
const DURATION = 1.05;

/**
 * easeOutExpo. Effectively all of the distance is covered in the first third of
 * the duration, so the page answers the wheel instantly and only the last few
 * pixels are interpolated. That asymmetry is the whole trick: a symmetric curve
 * (or a plain lerp) delays the START of the move, which is exactly the input lag
 * that makes smooth scroll feel broken rather than smooth.
 */
const EASE = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Smooth scroll, driven off `gsap.ticker`.
 *
 * This is the single largest difference between this site and the ones it is
 * being measured against — every one of them runs it (Trionn, By-Kin, Uncommon
 * Studio). It is also the one that is easiest to get wrong, in three specific
 * ways, all of which this component is shaped around:
 *
 * **1. It must share a clock with ScrollTrigger.** Lenis has its own rAF loop
 * (`autoRaf`), and GSAP has `gsap.ticker`. Left on separate loops the two read
 * the scroll position on different frames, so every scrubbed animation trails
 * the scroll by a frame and the parallax layers shear against the content they
 * are supposed to be behind. Driving Lenis FROM the ticker — and pushing
 * `ScrollTrigger.update` from Lenis's own scroll event — collapses that to one
 * clock, one frame, no shear.
 *
 * `lagSmoothing(0)` goes with it and is not optional. GSAP's default lag
 * smoothing pretends a slow frame never happened, which is right for a timeline
 * playing on its own and catastrophic for one whose progress is a scroll
 * position: the animation would silently desync from the page it is pinned to
 * after any hitch (a font swap, an image decode) and never recover.
 *
 * **2. It must not touch touch.** Lenis leaves touch scrolling native by
 * default and this keeps that default deliberately. Interpolating a touch drag
 * throws away the momentum and rubber-band the OS gives for free, and the
 * result is universally worse than doing nothing — it is the reason "smooth
 * scroll" has the reputation it has. Wheel and keyboard only.
 *
 * **3. It must be genuinely absent under reduced motion.** Not "faster" —
 * absent. Someone who asks for reduced motion and gets interpolated scrolling
 * has had their setting ignored on the one gesture they perform most. The
 * instance is never constructed, so there is nothing to disable and no listener
 * to leak.
 *
 * Lenis scrolls the real window rather than transforming a wrapper, so
 * everything already built on scroll position keeps working untouched: the
 * header's `data-nav-sentinel` IntersectionObserver, the `useReveal` observers
 * behind all 34 entrances, `position: fixed` on the nav and the WhatsApp
 * button, and `scroll-margin-top` on anchor targets.
 *
 * Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Constructed only when motion is welcome — see (3) above.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: DURATION,
      easing: EASE,
      // We drive it from gsap.ticker — see (1). With autoRaf left on there
      // would be two loops advancing the same instance.
      autoRaf: false,
      // Wheel and keyboard only — see (2).
      smoothWheel: true,
      syncTouch: false,
    });

    // Lenis writes the scroll position, so ScrollTrigger must be told to
    // re-read on Lenis's event rather than on the browser's native one.
    lenis.on("scroll", ScrollTrigger.update);

    // gsap.ticker is in seconds, lenis.raf wants milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Anchor links.
       `scroll-margin-top: 5rem` in globals.css handles the nav clearance for
       NATIVE anchor jumps, but a native jump is instant and would tear straight
       through the interpolation Lenis is holding. Routing same-page anchors
       through `lenis.scrollTo` keeps one motion model for the whole page; the
       offset repeats the scroll-margin because Lenis is doing the scrolling and
       never sees the CSS property. */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's own default, restored.
      lenis.destroy();
    };
  }, []);

  return null;
}
