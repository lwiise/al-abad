"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Client-only before paint, so the layout switch never flashes. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type DeckMode = "static" | "scroll";
export type DeckCardState = "past" | "current" | "next";

/**
 * A deck of cards handed over one at a time by the scroll — the machinery
 * behind «كيف تبدأ؟» and «ماذا ستكتسب؟». The CSS lives in `app/globals.css`
 * under `.deck-*`; this owns two numbers and nothing else.
 *
 * The section renders `data-deck="static"` — a plain list, every card visible,
 * every diagram at its finished pose. That is what the server sends and what a
 * reader without JS or with reduced motion keeps. Only once the client confirms
 * it can honour the motion does it switch to `"scroll"`, where the track grows
 * tall, the stage sticks, and the cards are dealt into a single grid cell so
 * exactly one is on screen at a time.
 *
 * Progress is written straight to the element as `--deck-p` (the rail reads it
 * every frame without a re-render); only crossing into a new card is state.
 */
export function useScrollDeck(count: number): {
  track: RefObject<HTMLDivElement | null>;
  mode: DeckMode;
  current: number;
  stateOf: (i: number) => DeckCardState;
  goTo: (i: number) => void;
} {
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [mode, setMode] = useState<DeckMode>("static");
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);

  useIsoLayoutEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setMode("scroll");
  }, []);

  useEffect(() => {
    const el = track.current;
    if (mode !== "scroll" || !el) return;

    const apply = (progress: number) => {
      el.style.setProperty("--deck-p", progress.toFixed(4));
      // Equal bands, one per card: the last one keeps the stage to the end.
      const i = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
      setCurrent((prev) => (prev === i ? prev : i));
    };

    // start/end are exactly the sticky travel — the stage is one viewport tall
    // and the track is taller by the hold distance of every card.
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    trigger.current = st;
    apply(st.progress);

    // A card is only the current one while the section is anywhere near the
    // viewport. Without this both decks keep a diagram animating for the whole
    // page — and the first card of each would have been running since mount
    // rather than starting from its first frame when you arrive at it.
    const near = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setInView(self.isActive),
    });
    setInView(near.isActive);

    return () => {
      st.kill();
      near.kill();
      trigger.current = null;
    };
  }, [mode, count]);

  const stateOf = useCallback(
    (i: number): DeckCardState => {
      if (mode === "static") return "current";
      if (!inView) return i < current ? "past" : "next";
      return i === current ? "current" : i < current ? "past" : "next";
    },
    [mode, inView, current],
  );

  /** Rail click: jump to the middle of that card's band. */
  const goTo = useCallback(
    (i: number) => {
      const st = trigger.current;
      if (!st) return;
      window.scrollTo({
        top: st.start + (st.end - st.start) * ((i + 0.5) / count),
        behavior: "smooth",
      });
    },
    [count],
  );

  return { track, mode, current, stateOf, goTo };
}
