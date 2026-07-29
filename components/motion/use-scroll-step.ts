"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

// Layout effect on the client, plain effect on the server — same shape as
// use-reveal.ts, so nothing warns during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * THE BAND IS ANCHORED TO THE STICKY NAV, NOT TO A FRACTION OF THE VIEWPORT.
 *
 * The last step lands when the block's TOP has travelled up to just under the
 * nav — because "the art is about to slide under the bar" is the actual
 * constraint on when a step may still be presented. The first step lands at
 * `START_FRACTION` down the screen, or as soon as the block has fully entered
 * from the bottom, whichever comes later (`idle` is not a resting pose, it is an
 * empty slot, so a block sitting fully visible with nothing drawn in it reads as
 * broken).
 *
 * The version this replaced put both ends on viewport fractions (centre at 0.88
 * → 0.22) and it failed, measured, on every short viewport: at 844×390 all three
 * artifacts played with the art under the nav, and at 320×568 and 720×450 (a
 * 1440×900 laptop at 200% zoom) the last one or two did. A fraction cannot know
 * where the nav ends, and on a short screen 22% of the viewport is above it.
 *
 * Travel is then clamped into [MIN_TRAVEL, MAX_TRAVEL] × viewport height, and
 * WHICH END MOVES when it is clamped is the whole subtlety:
 *   - too little room (block TALLER than the space under the nav — a landscape
 *     phone is 336px of block in 322px of room): the floor moves the START
 *     earlier, keeping the end just under the nav. Part of the list is off screen
 *     there whatever we do; this spends that unavoidable clipping on the rows and
 *     keeps the art, which is the thing that moves, on screen for every step.
 *   - too much room (a tall window): the cap moves the END earlier, keeping the
 *     start where the block finishes entering. Capping the start instead — which
 *     is what this did first — put the band's beginning ABOVE the point where the
 *     block is fully visible, so a 1440×1440 window showed the whole block with
 *     an empty art slot for ~200px of scroll (measured: 3 of 15 samples). Since
 *     `idle` is not a resting pose but an empty tile, that reads as broken.
 */
const START_FRACTION = 0.88;
const MIN_TRAVEL = 0.35;
const MAX_TRAVEL = 0.66;

/** Slack under the nav, so the last step lands clear of it rather than touching. */
const SAFE_SLACK = 16;

/**
 * Minimum time a step stays applied before the next one may take over — and,
 * because steps are never skipped (see the march below), also the cadence the
 * catch-up runs at. 620ms is `--mi-move` in app/globals.css: one artifact's
 * transition, so every step gets long enough to be recognised as the thing it
 * is. The tail of each artifact's per-element stagger (up to 350ms more)
 * overlaps the next one deliberately — the whole section is built out of
 * transitions rather than keyframes precisely so a state change can interrupt
 * cleanly at any point.
 */
const MIN_HOLD_MS = 620;

/**
 * Which of `count` steps the scroll is on — for a block that presents its items
 * one at a time as it travels up the viewport.
 *
 * Returns `null` until the block reaches the band (nothing is being presented
 * yet), then 0…count-1 in turn, holding the last one once the block has passed.
 * No ScrollTrigger, nothing pinned and nothing scrubbed: this does not take the
 * scroll over, it only names the current step, which the caller turns into one
 * `data-state` string for CSS.
 *
 * NO STEP IS EVER SKIPPED, and that is the whole point — the brief was "one by
 * one". A rate limiter alone does not deliver it: one step is 60–320px of scroll
 * depending on the window, and a single wheel gesture or any phone flick crosses
 * that in well under `MIN_HOLD_MS`. So the scroll sets a TARGET and the hook
 * marches to it one step per hold, which means a fast scroll makes the art lag
 * rather than skip — it finishes the sequence within count × MIN_HOLD_MS of the
 * scroll stopping, and the last step holds anyway. The behaviour this replaced
 * (jump to wherever the scroll ended) silently dropped the middle step on every
 * ordinary wheel scroll.
 *
 * Reduced motion resolves to step 0 and never moves — with transitions stripped,
 * a scroll-driven change is a snap, not an animation. The other steps stay
 * reachable by pointer or keyboard, which is the caller's business.
 *
 * KNOWN LIMIT: the band ends with the block near the top of the window, so a
 * block sitting at the very bottom of a short page — with no scroll left to
 * bring it up there — never reaches its last step. Fine for a section in the
 * middle of a long page, which is what this is for.
 *
 * Sibling to use-scroll-deck.ts, which is the heavier tool: that one grows a
 * track, pins a stage and deals cards; this one just follows along.
 */
export function useScrollStep(
  ref: RefObject<HTMLElement | null>,
  count: number,
): number | null {
  const [step, setStep] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStep(count > 0 ? 0 : null);
      return;
    }

    let applied: number | null = null;
    let target: number | null = null;
    let appliedAt = 0;
    let hold: ReturnType<typeof setTimeout> | null = null;
    let frame = 0;
    // Measuring costs a forced layout, so only do it while the block is
    // anywhere near the viewport — same guard as use-scroll-deck's `near`
    // trigger, and the reason this hook can be added to a section without
    // putting a rect read in every scroll frame of every other page.
    let near = false;
    let safeTop = 0;

    /** `--nav-h` is the nav's UNSCROLLED height (84px / 68px below 768px); it
     *  shrinks to `--nav-h-scrolled` once the page moves, which is exactly when
     *  this band is in play — so reading the taller value is the conservative
     *  choice and needs no scroll state. Re-read on resize, since it is a media
     *  query away from changing. */
    const readSafeTop = () => {
      const raw = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      );
      safeTop = (Number.isFinite(raw) ? raw : 0) + SAFE_SLACK;
    };

    /** One step toward the target — never a jump past an unplayed step. */
    const nextToward = (from: number | null, to: number | null): number | null => {
      if (to === null) return null; // left the band: idle at once, nothing to play
      // First application. Landing straight on the last step means the band is
      // already behind us — the visitor arrived from below it, or flicked clear
      // past the block — so there is nothing to present and the art just takes
      // its resting pose. Anything else starts at the first step and marches.
      if (from === null) return to >= count - 1 ? to : 0;
      return from + Math.sign(to - from);
    };

    const tick = () => {
      hold = null;
      if (target === applied) return;
      applied = nextToward(applied, target);
      appliedAt = performance.now();
      setStep(applied);
      if (applied !== target) hold = setTimeout(tick, MIN_HOLD_MS);
    };

    const commit = (next: number | null) => {
      target = next;
      // A march already in flight will pick the new target up when it fires.
      if (hold || target === applied) return;
      const wait = MIN_HOLD_MS - (performance.now() - appliedAt);
      if (wait <= 0) tick();
      else hold = setTimeout(tick, wait);
    };

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight || 0;
      if (count < 1 || vh <= 0) return;
      const rect = el.getBoundingClientRect();
      // Both ends as block-top positions: the first step lands at the low line or
      // as soon as the block has fully entered (later wins), the last one with the
      // block's top just clear of the nav.
      let startTop = Math.min(vh * START_FRACTION, vh - rect.height);
      let endTop = safeTop;
      const room = startTop - endTop;
      if (room > vh * MAX_TRAVEL) endTop = startTop - vh * MAX_TRAVEL;
      else if (room < vh * MIN_TRAVEL) startTop = endTop + vh * MIN_TRAVEL;
      const travel = startTop - endTop;
      const progress = (startTop - rect.top) / travel;
      commit(progress < 0 ? null : Math.min(count - 1, Math.floor(progress * count)));
    };

    const onScroll = () => {
      if (!near || frame) return;
      frame = requestAnimationFrame(measure);
    };

    const onResize = () => {
      readSafeTop();
      onScroll();
    };

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) near = entry.isIntersecting;
              if (near) measure();
            },
            // One viewport of slack each side: the band lives inside the
            // viewport, so this is only ever a gate, never a boundary the
            // stepping can feel.
            { root: null, rootMargin: "100% 0px 100% 0px", threshold: 0 },
          );

    readSafeTop();
    if (io) io.observe(el);
    else {
      // No IO → measure unconditionally rather than never.
      near = true;
      measure();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      if (hold) clearTimeout(hold);
    };
    // The element is server-rendered and static per mount; only a CMS change to
    // how many steps there are can move the band boundaries, and rebuilding one
    // scroll listener for that is cheaper than reading the count through a ref.
  }, [ref, count]);

  return step;
}
