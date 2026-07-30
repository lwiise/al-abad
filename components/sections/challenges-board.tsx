"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import {
  CHALLENGE_STATES,
  ChallengesDiagram,
  type DiagramState,
} from "./art/challenges-diagram";
import { HeadingRule } from "./section";

/**
 * The reading line: whichever row is crossing it is the row the drawing answers
 * to. Just below the middle of the window, and both layouts want it there for
 * different reasons — which is why it is one number and not a pair keyed to the
 * 1080px switch.
 *
 * Stacked, the diagram sticks at `top-20` and covers the top ~400px, so the
 * line has to clear it: the active row is then always the one BELOW the
 * artwork, never one of the rows passing behind it. Wide, the diagram sits
 * beside the list and the constraint is the other end — the last challenge has
 * to take the drawing while the drawing is still clear of the fixed nav. At 50%
 * the six pressure dots of القلق arrive with their top row already behind the
 * header on a 768px laptop: the section's last state, half hidden. Higher than
 * this and the list's last row is under the fold when its first row lights up.
 */
const FOCUS_LINE = "55%";

/**
 * The floor on how fast the drawing may be handed from one challenge to the
 * next, and it is the diagram's own transition length — a state may not be
 * replaced before it has finished arriving.
 *
 * It is doing the real work here, because the list is only ~330px tall: five
 * challenges over its own travel is ~65px of scroll each, and no line placement
 * can widen that without pushing either the first row or the last one off the
 * screen it is supposed to be lighting up. A reader moving at any ordinary
 * speed therefore crosses several rows inside one transition. Ungoverned, ضعف
 * التواصل's strokes would never finish breaking into dashes and القلق's six
 * dots would never land — the section would read as a flicker rather than as
 * five drawings.
 *
 * The scroll still wins: when the floor lifts, what lands is the row under the
 * line at THAT moment, not one that was queued behind it. Nothing is buffered,
 * so a fast scroll skips challenges rather than falling behind — the drawing is
 * never showing one thing while the list highlights another.
 */
const MIN_DWELL_MS = 650;

/**
 * Half of تكرار الخلافات's ~1.2s cycle. The oscillation is driven by flipping
 * `data-phase` on the SVG rather than by a keyframe animation, because CSS will
 * not start a transition for a property an animation was driving: leaving the
 * state mid-cycle would drop the offset in a single frame, and the drift-apart
 * of فتور العلاقة would jump instead of glide. Transitions all the way through
 * means every exit eases out of wherever the circles actually are.
 */
const CLASH_HALF_CYCLE_MS = 600;

/**
 * Which row the scroll is on — `null` until the list reaches the line.
 *
 * One trigger over the whole list rather than one per row: past the end the
 * progress stays at 1, so the last challenge KEEPS the drawing while the
 * section leaves instead of the diagram snapping back to idle with the list
 * still on screen. Below the start it is 0, which is idle — the section rests
 * until the reader arrives at it, and rests again if they scroll back above it.
 */
function useScrolledRow(
  list: RefObject<HTMLElement | null>,
  count: number,
): number | null {
  const [row, setRow] = useState<number | null>(null);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    // The drawing used to move only for a reader who pointed at a row; it now
    // moves at everybody, so the preference is honoured by never driving it at
    // all. No trigger, no state change — the diagram holds its resting pose,
    // and globals.css stops its breathing to match.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // Equal bands, one per row: the list's own travel past the line, divided by
    // the number of challenges on it.
    const apply = (p: number) =>
      setRow(p <= 0 ? null : Math.min(count - 1, Math.floor(p * count)));

    const st = ScrollTrigger.create({
      trigger: el,
      start: `top ${FOCUS_LINE}`,
      end: `bottom ${FOCUS_LINE}`,
      onUpdate: (self) => apply(self.progress),
      // Leaving either end is a progress change the update pass can land on the
      // same frame; refresh re-reads after fonts swap and on resize.
      onToggle: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);

    return () => {
      st.kill();
      setRow(null);
    };
  }, [list, count]);

  return row;
}

/** Holds each challenge for at least `MIN_DWELL_MS` — see the constant. */
function useHeld(target: number | null): number | null {
  const [shown, setShown] = useState<number | null>(null);
  const landedAt = useRef(0);

  useEffect(() => {
    if (target === shown) return;
    const land = () => {
      landedAt.current = performance.now();
      setShown(target);
    };
    const wait = MIN_DWELL_MS - (performance.now() - landedAt.current);
    if (wait <= 0) {
      land();
      return;
    }
    // Re-scheduled from scratch whenever the scroll moves on, so the row that
    // lands is always the newest one rather than the one this timer started for.
    const id = setTimeout(land, wait);
    return () => clearTimeout(id);
  }, [target, shown]);

  return shown;
}

export function ChallengesBoard({
  items,
  heading,
  lede,
}: {
  items: string[];
  heading: string;
  lede: string;
}) {
  const list = useRef<HTMLUListElement>(null);
  const active = useHeld(useScrolledRow(list, items.length));

  const state: DiagramState =
    active === null ? "idle" : CHALLENGE_STATES[active % CHALLENGE_STATES.length];

  const diagram = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = diagram.current;
    if (state !== "conflict" || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let phase = 0;
    const id = setInterval(() => {
      phase ^= 1;
      el.setAttribute("data-phase", String(phase));
    }, CLASH_HALF_CYCLE_MS);
    return () => {
      clearInterval(id);
      el.removeAttribute("data-phase");
    };
  }, [state]);

  return (
    <div className="flex flex-col gap-8 min-[1080px]:grid min-[1080px]:grid-cols-[1fr_0.9fr] min-[1080px]:gap-x-16">
      <header className="min-[1080px]:col-start-1 min-[1080px]:row-start-1">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">{heading}</h2>
        <HeadingRule />
        {/* The strongest sentence in the section, and the second thing read. */}
        <p className="mt-5 max-w-[52ch] text-xl text-foreground-muted">{lede}</p>
      </header>

      {/* Stacked: sticks below the header so it stays in view while the list
          scrolls. Ground of its own so rows pass behind it, not through — must
          match the section's band, which is now section 1's surface, or the
          diagram sits in a visible rectangle as the list scrolls under it. */}
      <div className="sticky top-20 z-10 -mx-2 bg-surface px-2 pb-4 min-[1080px]:static min-[1080px]:z-auto min-[1080px]:mx-0 min-[1080px]:col-start-2 min-[1080px]:row-start-1 min-[1080px]:row-end-3 min-[1080px]:self-center min-[1080px]:px-0 min-[1080px]:pb-0">
        {/* Sized in globals.css, not with responsive utilities: the 1080px
            breakpoint has to be an arbitrary variant, and Tailwind orders those
            ahead of the named ones, so `sm:` would win at desktop widths. */}
        <ChallengesDiagram state={state} ref={diagram} />
        {/* One standing sentence, not a live region. The drawing used to change
            because a reader chose a row, which is an action worth announcing;
            it now changes because the page scrolled, and narrating that would
            read out five descriptions to somebody who never asked for one. The
            list itself carries every challenge as text. */}
        <p className="sr-only">
          رسم توضيحي: دائرتان متداخلتان تمثّلان طرفَي العلاقة، وفي منطقة تداخلهما
          قلب — ويتبدّل شكلهما مع كل تحدٍّ من القائمة أثناء التمرير.
        </p>
      </div>

      <ul
        ref={list}
        className="divide-y divide-border-strong border-y border-border-strong min-[1080px]:col-start-1 min-[1080px]:row-start-2"
      >
        {items.map((item, i) => (
          // Not a control any more: the scroll chooses the row, so there is
          // nothing here to press. The marker echoes the diagram's circles —
          // an outline that fills while its row is driving them.
          <li
            key={i}
            className="ch-row flex items-center gap-4 py-4"
            data-active={active === i ? "true" : undefined}
          >
            <span className="ch-marker size-4 shrink-0 rounded-full border-2" aria-hidden="true" />
            <span className="ch-label text-lg font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
