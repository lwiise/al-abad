"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

// Layout effect on the client, plain effect on the server — same shape as
// use-reveal.ts, so nothing warns during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The band, measured on the element's CENTRE against fractions of the viewport
 * height: the first step lands when the centre is 88% down the screen (or as
 * soon as the block has finished entering, whichever is later — see below) and
 * the last one when it reaches 22%.
 *
 * Centre, not top-and-bottom. The obvious version — start when the top crosses
 * a low line, finish when the bottom crosses a high one — makes the travel a
 * function of the element's height, so a block taller than the band scrolls its
 * own top off the screen before the last step arrives. That is exactly the
 * failure mode for a block whose art sits ABOVE its list: the last step would
 * light up with its artifact already gone off the top. Two thirds of a viewport
 * of travel, centred, keeps the whole block in view from first step to last at
 * any height that fits the screen, and degrades symmetrically when it doesn't.
 */
const START_LINE = 0.88;
const END_LINE = 0.22;

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
 * one". A rate limiter alone does not deliver it: at three steps in two thirds
 * of a viewport, one step is ~200px of scroll, and one wheel gesture or any
 * phone flick crosses that in well under `MIN_HOLD_MS`. So the scroll sets a
 * TARGET and the hook marches to it one step per hold, which means a fast
 * scroll makes the art lag rather than skip — it finishes the sequence within
 * count × MIN_HOLD_MS of the scroll stopping, and the last step holds anyway.
 * The old behaviour (jump to wherever the scroll ended) silently dropped the
 * middle step on every ordinary wheel scroll.
 *
 * Reduced motion resolves to step 0 and never moves — with transitions
 * stripped, a scroll-driven change is a snap, not an animation. The other steps
 * stay reachable by pointer or keyboard, which is the caller's business.
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
      // Start at the line, OR as soon as the block has finished entering from
      // the bottom, whichever comes later. Without the second clause a tall
      // window shows the whole block — art slot included — with nothing drawn
      // in it for a couple of hundred px of scroll, since `idle` is not a
      // resting pose, it is empty.
      const start = Math.min(vh * START_LINE, vh - rect.height / 2);
      const travel = start - vh * END_LINE;
      if (travel <= 0) return;
      const progress = (start - (rect.top + rect.height / 2)) / travel;
      commit(progress < 0 ? null : Math.min(count - 1, Math.floor(progress * count)));
    };

    const onScroll = () => {
      if (!near || frame) return;
      frame = requestAnimationFrame(measure);
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
    if (io) io.observe(el);
    else {
      // No IO → measure unconditionally rather than never.
      near = true;
      measure();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (hold) clearTimeout(hold);
    };
    // The element is server-rendered and static per mount; only a CMS change to
    // how many steps there are can move the band boundaries, and rebuilding one
    // scroll listener for that is cheaper than reading the count through a ref.
  }, [ref, count]);

  return step;
}
