"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

// Layout effect on the client (runs before paint → no flash of visible-then-
// hidden); plain effect on the server so SSR doesn't warn. Same guard as
// components/motion/use-reveal.ts.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STAGGER_MS = 70;

/**
 * Entrance for the courses section: 24px rise + fade, once, on intersection.
 *
 * ONE IntersectionObserver watches all five cards. Cards that cross the line
 * together are staggered ~70ms apart in DOM order — so on desktop the flagship
 * lands first and the 2×2 grid follows in sequence, while on a phone (where the
 * cards arrive one at a time) each simply enters on its own with no dead delay.
 *
 * Cards render VISIBLE and are only hidden once this effect confirms IO exists
 * and motion is allowed, so every failure path — no JS, no IO, reduced motion,
 * slow hydration — leaves the section fully readable. The transition itself is
 * on the item (see `ENTER_ITEM`), which keeps this file free of styling.
 */
export function EnterOnView({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-enter-item]"));
    for (const item of items) item.dataset.enter = "hidden";

    const io = new IntersectionObserver(
      (entries, obs) => {
        // Stagger within the batch that arrived together, in DOM order.
        const arrived = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => items.indexOf(a) - items.indexOf(b));

        arrived.forEach((item, i) => {
          item.style.transitionDelay = `${i * STAGGER_MS}ms`;
          item.dataset.enter = "shown";
          obs.unobserve(item); // once
        });
      },
      // threshold 0 so a card taller than the viewport still fires; the negative
      // bottom margin starts it just before the card is fully in view.
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    for (const item of items) io.observe(item);
    return () => io.disconnect();
    // Set up once — the cards are server-rendered and static per mount.
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

// The class list that pairs with this observer lives in ../course-showcase.tsx
// as ENTER_ITEM. It is deliberately NOT exported from here: a plain value
// exported from a "use client" module reaches a Server Component as a client
// reference, which cn()/clsx silently drops (it is an object, not a string).
