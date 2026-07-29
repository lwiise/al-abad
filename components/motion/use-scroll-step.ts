"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

// Layout effect on the client, plain effect on the server — same shape as
// use-reveal.ts, so nothing warns during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The band, measured on the element's CENTRE against fractions of the viewport
 * height: step 0 lands when the centre is 75% down the screen and the last one
 * when it reaches 25%.
 *
 * Centre, not top-and-bottom. The obvious version — start when the top crosses
 * a low line, finish when the bottom crosses a high one — makes the travel a
 * function of the element's height, so a block taller than the band scrolls its
 * own top off the screen before the last step arrives. That is exactly the
 * failure mode for a block whose art sits ABOVE its list: the last مرتكز would
 * light up with its artifact already gone off the top. Half a viewport of
 * travel, centred, keeps the whole block in view from first step to last at any
 * height that fits the screen, and degrades symmetrically when it doesn't.
 */
const START_LINE = 0.75;
const END_LINE = 0.25;

/**
 * Minimum time a step stays applied before the scroll may move off it. The art
 * it drives takes ~900ms to play out (a 620ms transition plus the longest
 * stagger delay), so without a floor a flick-scroll strobes every step in three
 * frames and none of them reads. A deferred change re-reads the target when it
 * fires, so nothing queues up behind a fast scroll — it lands on wherever the
 * scroll actually ended.
 */
const MIN_HOLD_MS = 420;

/**
 * Which of `count` steps the scroll is on — for a block that presents its items
 * one at a time as it travels up the viewport.
 *
 * Returns `null` until the block reaches the band (nothing is being presented
 * yet), then 0…count-1 in turn, holding the last one once the block has passed.
 * No ScrollTrigger, nothing pinned and nothing scrubbed: this does not take the
 * scroll over, it only names the current step, which the caller turns into one
 * `data-state` string for CSS. Reduced motion resolves to step 0 and never
 * moves — with transitions stripped, a scroll-driven change is a snap.
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
      setStep(0);
      return;
    }

    let applied: number | null = null;
    let target: number | null = null;
    let appliedAt = 0;
    let hold: ReturnType<typeof setTimeout> | null = null;
    let frame = 0;

    const commit = (next: number | null) => {
      target = next;
      if (target === applied) return;
      const wait = MIN_HOLD_MS - (performance.now() - appliedAt);
      if (wait > 0) {
        // One deferred commit at a time — it re-reads `target` when it fires.
        if (!hold) {
          hold = setTimeout(() => {
            hold = null;
            commit(target);
          }, wait);
        }
        return;
      }
      applied = target;
      appliedAt = performance.now();
      setStep(applied);
    };

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight || 0;
      const travel = vh * (START_LINE - END_LINE);
      if (travel <= 0 || count < 1) return;
      const rect = el.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      const progress = (vh * START_LINE - centre) / travel;
      commit(progress < 0 ? null : Math.min(count - 1, Math.floor(progress * count)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (hold) clearTimeout(hold);
    };
    // The element is server-rendered and static per mount; only a CMS change to
    // how many مرتكزات there are can move the band boundaries, and rebuilding
    // one scroll listener for that is cheaper than reading the count through a
    // ref.
  }, [ref, count]);

  return step;
}
