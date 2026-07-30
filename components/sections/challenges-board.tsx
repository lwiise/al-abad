"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";
import {
  CHALLENGE_STATES,
  ChallengesDiagram,
  type DiagramState,
} from "./art/challenges-diagram";
import { HeadingRule } from "./section";

/** Client-only before paint, so the stage never flashes unpinned. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * `scroll` holds the stage still and lets the scroll walk the list; `static` is
 * the section as tall as its content, the way the server renders it. `top` and
 * `height` are the pinned stage's measured offset and height — the CSS sticks it
 * at the first, and the trigger's own start/end are read off both.
 */
type Stage = { mode: "static" | "scroll"; top: number; height: number };

const UNPINNED: Stage = { mode: "static", top: 0, height: 0 };

/** Below this the diagram sits above the list rather than beside it. */
const STACKED = "(max-width: 1079.98px)";

/**
 * The layout is external state, so read it as such rather than in an effect.
 * The server snapshot is the wide arrangement, which degrades to the stacked
 * ONE at narrow widths anyway (the grid is behind `min-[1080px]:`), so the swap
 * on hydration moves the heading out of the stage and changes nothing visible.
 */
function useStackedLayout() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(STACKED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(STACKED).matches,
    () => false,
  );
}

/**
 * The reading line, used in `static` mode only — pinned there is nothing for a
 * row to cross, so the track's own progress picks the challenge instead.
 *
 * Just below the middle of the window, and both layouts want it there for
 * different reasons. Stacked, the diagram sticks at `top-20` and covers the top
 * ~400px, so the line has to clear it: the active row is then always the one
 * BELOW the artwork, never one of the rows passing behind it. Wide, the diagram
 * sits beside the list and the constraint is the other end — the last challenge
 * has to take the drawing while the drawing is still clear of the fixed nav. At
 * 50% the six pressure dots of القلق arrive with their top row already behind
 * the header on a 768px laptop: the section's last state, half hidden. Higher
 * than this and the list's last row is under the fold when its first row lights
 * up.
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
 * The clearance the pinned board keeps above itself: the scrolled height of the
 * fixed nav plus 1rem, read from the same custom property `.ch-stage` falls
 * back to so the two cannot drift on the number that matters.
 */
function navClearance() {
  const nav = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h-scrolled"),
  );
  return (Number.isFinite(nav) ? nav : 64) + 16;
}

/**
 * Pin the stage — but only where the stage FITS the window.
 *
 * A sticky stage taller than the screen does not scroll inside itself; it holds
 * at the top and its bottom is simply never reachable, so its last challenges
 * would light up below the fold. Hence a measurement rather than a guess: the
 * fit is re-read on mount, after the font swap, and on every resize, and where
 * it fails the section falls back to the unpinned reading line.
 *
 * What gets pinned is not the same thing in both layouts, and that is what lets
 * a phone pin at all. Wide, the stage is the whole board — heading, drawing and
 * list side by side, ~520px. Stacked, they are stacked, and all three together
 * are ~840px against a ~660–850px window, which fits nothing; so the heading
 * stays OUTSIDE the stage there and scrolls away above it, leaving the drawing
 * and the list — ~570px — as the thing that holds. The reader has read the
 * question by then; what they need held is the pair that answers it.
 *
 * The offset is measured in the same pass: half the leftover window, so the
 * held stage is centred, floored at the nav clearance.
 */
function useStage(
  track: RefObject<HTMLElement | null>,
  stageEl: RefObject<HTMLElement | null>,
  stacked: boolean,
): Stage {
  const [stage, setStage] = useState<Stage>(UNPINNED);

  useIsoLayoutEffect(() => {
    const el = stageEl.current;
    const outer = track.current;
    if (!el || !outer) return;
    // The drawing used to move only for a reader who pointed at a row; it now
    // moves at everybody, so the preference is honoured by never driving it at
    // all — and a section that holds the screen is the last thing to force on
    // somebody who asked for less motion. No pin, no trigger, no state change:
    // the diagram holds its resting pose and globals.css stops its breathing.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let live = true;
    const measure = () => {
      if (!live) return;
      const height = el.offsetHeight;
      const clear = navClearance();
      // + 2rem so a board that only just fits still has air under it.
      if (height + clear + 32 > window.innerHeight) {
        setStage((prev) => (prev.mode === "static" ? prev : UNPINNED));
        return;
      }
      const top = Math.max(clear, Math.round((window.innerHeight - height) / 2));
      outer.style.setProperty("--ch-stick-top", `${top}px`);
      setStage((prev) =>
        prev.mode === "scroll" && prev.top === top && prev.height === height
          ? prev
          : { mode: "scroll", top, height },
      );
    };

    measure();
    // The stage's height moves with the font swap; the window's with a resize.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => {
      live = false;
      window.removeEventListener("resize", measure);
    };
    // `stacked` re-measures because it is a different element being pinned, not
    // merely a different width.
  }, [track, stageEl, stacked]);

  return stage;
}

/**
 * Which challenge the scroll is on — `null` before it reaches the first.
 *
 * Pinned, the timeline is the stage's own sticky travel, bounded by the two
 * moments CSS itself uses: the stage's top reaching its sticky offset, and the
 * track's bottom reaching the stage's bottom. That distance is the hold exactly,
 * divided into equal bands. It takes both a trigger and an endTrigger because
 * the two ends belong to different elements — stacked, the stage starts a
 * heading's height down the track. Unpinned the timeline is the list's passage
 * across the reading line instead. Either way one trigger, same arithmetic.
 *
 * Past the end the progress stays at 1, so the last challenge KEEPS the drawing
 * while the section leaves rather than the diagram snapping back to idle in
 * front of the reader. Below the start it is 0, which is idle — the board
 * arrives at rest, takes its first challenge on the first pixel of the walk,
 * and rests again if the reader scrolls back above it.
 */
function useScrolledRow(
  track: RefObject<HTMLElement | null>,
  stageEl: RefObject<HTMLElement | null>,
  list: RefObject<HTMLElement | null>,
  count: number,
  stage: Stage,
): number | null {
  const [row, setRow] = useState<number | null>(null);
  const { mode, top, height } = stage;

  useEffect(() => {
    const pinned = mode === "scroll";
    const el = pinned ? stageEl.current : list.current;
    const outer = track.current;
    if (!el || !outer) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const apply = (p: number) =>
      setRow(p <= 0 ? null : Math.min(count - 1, Math.floor(p * count)));

    const st = ScrollTrigger.create({
      trigger: el,
      start: pinned ? `top ${top}px` : `top ${FOCUS_LINE}`,
      endTrigger: pinned ? outer : el,
      end: pinned ? `bottom ${top + height}px` : `bottom ${FOCUS_LINE}`,
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
  }, [track, stageEl, list, count, mode, top, height]);

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
  const track = useRef<HTMLDivElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const stacked = useStackedLayout();
  const stage = useStage(track, stageEl, stacked);
  const active = useHeld(useScrolledRow(track, stageEl, list, items.length, stage));

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

  const head = (
    <header className="min-[1080px]:col-start-1 min-[1080px]:row-start-1">
      <h2 className="text-3xl font-bold text-foreground md:text-4xl">{heading}</h2>
      <HeadingRule />
      {/* The strongest sentence in the section, and the second thing read. */}
      <p className="mt-5 max-w-[52ch] text-xl text-foreground-muted">{lede}</p>
    </header>
  );

  const plate = (
    // Stacked and UNPINNED: sticks below the header so it stays in view while
    // the list scrolls. Ground of its own so rows pass behind it, not through —
    // must match the section's band, which is now section 1's surface, or the
    // diagram sits in a visible rectangle as the list scrolls under it. Pinned,
    // nothing scrolls under it and globals.css flattens it back into the board.
    <div className="ch-plate sticky top-20 z-10 -mx-2 bg-surface px-2 pb-4 min-[1080px]:static min-[1080px]:z-auto min-[1080px]:mx-0 min-[1080px]:col-start-2 min-[1080px]:row-start-1 min-[1080px]:row-end-3 min-[1080px]:self-center min-[1080px]:px-0 min-[1080px]:pb-0">
      {/* Sized in globals.css, not with responsive utilities: the 1080px
          breakpoint has to be an arbitrary variant, and Tailwind orders those
          ahead of the named ones, so `sm:` would win at desktop widths. */}
      <ChallengesDiagram state={state} ref={diagram} />
      {/* One standing sentence, not a live region. The drawing used to change
          because a reader chose a row, which is an action worth announcing; it
          now changes because the page scrolled, and narrating that would read
          out five descriptions to somebody who never asked for one. The list
          itself carries every challenge as text. */}
      <p className="sr-only">
        رسم توضيحي: دائرتان متداخلتان تمثّلان طرفَي العلاقة، وفي منطقة تداخلهما
        قلب — ويتبدّل شكلهما مع كل تحدٍّ من القائمة أثناء التمرير.
      </p>
    </div>
  );

  const rows = (
    <ul
      ref={list}
      className="divide-y divide-border-strong border-y border-border-strong min-[1080px]:col-start-1 min-[1080px]:row-start-2"
    >
      {items.map((item, i) => (
        // Not a control any more: the scroll chooses the row, so there is
        // nothing here to press. The marker echoes the diagram's circles — an
        // outline that fills while its row is driving them.
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
  );

  // Same three pieces, two arrangements, and the difference is what the stage
  // contains — i.e. what holds still. Wide, it is the whole board. Stacked, the
  // heading is above the stage instead of inside it: all three together are
  // taller than a phone, and the drawing with its list is not. Sizing for both
  // is in globals.css under `.ch-track`.
  return (
    <div
      ref={track}
      className="ch-track"
      data-ch={stage.mode}
      style={{ "--ch-count": items.length } as CSSProperties}
    >
      {stacked ? (
        <>
          {head}
          <div ref={stageEl} className="ch-stage mt-8 flex flex-col gap-8">
            {plate}
            {rows}
          </div>
        </>
      ) : (
        <div
          ref={stageEl}
          className="ch-stage flex flex-col gap-8 min-[1080px]:grid min-[1080px]:grid-cols-[1fr_0.9fr] min-[1080px]:gap-x-16"
        >
          {head}
          {plate}
          {rows}
        </div>
      )}
      {/* The hold: the scroll distance the stage stays put for. Empty, and a
          sibling rather than padding on the track — see the `.ch-hold` note. */}
      <div className="ch-hold" aria-hidden="true" />
    </div>
  );
}
