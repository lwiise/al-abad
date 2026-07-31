"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
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
 * the section as tall as its content, the way the server renders it.
 *
 * `top` and `height` are the pinned stage's measured offset and height — the CSS
 * sticks it at the first, and the trigger's start/end are computed from both.
 * `line` is where a row has to cross for `static` mode to hand it the drawing.
 */
type Stage = { mode: "static" | "scroll"; top: number; height: number; line: number };

const UNPINNED: Stage = { mode: "static", top: 0, height: 0, line: 0 };

/** Below this the diagram sits above the list rather than beside it. */
const STACKED = "(max-width: 1079.98px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Hoisted per query: a fresh closure each render re-subscribes on every render. */
function subscriber(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}
const SUBSCRIBE: Record<string, (onChange: () => void) => () => void> = {
  [STACKED]: subscriber(STACKED),
  [REDUCED]: subscriber(REDUCED),
};

/**
 * A media query as external state, which is what it is — read in an effect it
 * would be a snapshot of the moment the section mounted, and both of these can
 * change under a reader mid-session: one by rotating the phone, the other by
 * turning on «تقليل الحركة» in the OS.
 *
 * Both server snapshots are `false`, and both are safe defaults: the wide
 * arrangement degrades to the stacked one at narrow widths anyway (its grid is
 * behind `min-[1080px]:`), so the swap on hydration moves the heading out of the
 * stage and changes nothing visible; and motion is off until a measurement says
 * otherwise, so `false` never starts something a reader asked not to have.
 */
function useMedia(query: string) {
  return useSyncExternalStore(
    SUBSCRIBE[query],
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Where the reading line sits in `static` mode, as a fraction of the window —
 * pinned there is nothing for a row to cross, so the track's own progress picks
 * the challenge instead.
 *
 * Just below the middle, and both layouts want it there for different reasons.
 * Stacked, the diagram sticks at `top-20` and covers the top of the window, so
 * the line has to clear it: the active row is then always the one BELOW the
 * artwork, never one of the rows passing behind it. Wide, the diagram sits
 * beside the list and the constraint is the other end — the last challenge has
 * to take the drawing while the drawing is still clear of the fixed nav. At 50%
 * the six pressure dots of القلق arrive with their top row already behind the
 * header on a 768px laptop: the section's last state, half hidden. Higher than
 * this and the list's last row is under the fold when its first row lights up.
 *
 * On a SHORT window the fraction is not enough on its own — a landscape phone
 * puts 55% at 215px while the sticky plate runs to 246px, so the row driving the
 * drawing sits behind the drawing. So the line is also pushed below the plate
 * (`LINE_CLEARANCE`), measured rather than assumed.
 */
const FOCUS_FRACTION = 0.55;
const LINE_CLEARANCE = 24;

/**
 * The floor on how fast the drawing may be handed from one challenge to the
 * next, and it is the diagram's own transition length — a state may not be
 * replaced before it has finished arriving.
 *
 * Pinned it rarely fires: a challenge holds 45svh, which is ~380px of scroll.
 * It is doing the real work in the `static` fallback, where the list is only
 * ~330px tall and five challenges over its own travel is ~65px of scroll each —
 * and no line placement widens that without pushing either the first row or the
 * last one off the screen it is supposed to be lighting up. Ungoverned there,
 * ضعف التواصل's strokes would never finish breaking into dashes and القلق's six
 * dots would never land: a flicker rather than five drawings.
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
 * The clearance the pinned stage keeps above itself: the scrolled height of the
 * fixed nav plus 1rem, read from the same custom property `.ch-stage` falls back
 * to so the two cannot drift on the number that matters. `FIT_AIR` is what a
 * stage that only just fits still keeps under it.
 */
function navClearance() {
  const nav = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h-scrolled"),
  );
  return (Number.isFinite(nav) ? nav : 64) + 16;
}
const FIT_AIR = 32;

/**
 * The SMALL viewport in px — `100svh`, not `innerHeight`.
 *
 * They are different numbers on a phone and the gap is a whole toolbar: Safari
 * on a 390×844 reports ~659 with its toolbar shown and ~745 once it collapses,
 * while `svh` stays at the smaller one throughout. The hold is sized in `svh`
 * (`.ch-hold`), so the fit test has to be too — measured against `innerHeight`
 * the pin/no-pin answer flips as the toolbar moves, which toggles ~1480px of
 * hold in one frame and jumps every section below it. Measuring the unit the CSS
 * actually uses is what makes the answer stable.
 */
function smallViewport() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;top:0;inset-inline-start:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.append(probe);
  const height = probe.offsetHeight;
  probe.remove();
  return height || window.innerHeight;
}

/**
 * Layout position in the document — `offsetTop` up the chain rather than a
 * bounding rect, because the section is wrapped in a `<Reveal>` whose entrance
 * translate is still applied when this first runs. A rect would read the track
 * 24px low and anchor the whole walk 24px late; `offsetTop` ignores transforms.
 */
function layoutTop(el: HTMLElement) {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    y += node.offsetTop;
  }
  return y;
}

/**
 * Pin the stage — but only where the stage FITS the window.
 *
 * A sticky stage taller than the screen does not scroll inside itself; it holds
 * at the top and its bottom is simply never reachable, so its last challenges
 * would light up below the fold. Hence a measurement rather than a guess, and a
 * ResizeObserver rather than a one-shot: the stage's own height moves when the
 * font swaps AND when the pin lands (the plate drops its padding), so the first
 * measurement is 16px pessimistic and the second is the one to trust.
 *
 * What gets pinned is not the same thing in both layouts, and that is what lets
 * a phone pin at all. Wide, the stage is the whole board — heading, drawing and
 * list side by side, ~520px. Stacked, they are stacked, and all three together
 * are ~840px against a ~660–850px window, which fits nothing; so the heading
 * stays OUTSIDE the stage there and scrolls away above it, leaving the drawing
 * and the list — ~565px — as the thing that holds. The reader has read the
 * question by then; what they need held is the pair that answers it.
 *
 * The offset is measured in the same pass: half the leftover window, so the held
 * stage is centred, floored at the nav clearance.
 */
function useStage(
  track: HTMLElement | null,
  stage: HTMLElement | null,
  reduced: boolean,
): Stage {
  const [value, setValue] = useState<Stage>(UNPINNED);

  useIsoLayoutEffect(() => {
    // The drawing used to move only for a reader who pointed at a row; it now
    // moves at everybody, so the preference is honoured by never driving it at
    // all — and a section that holds the screen is the last thing to force on
    // somebody who asked for less motion. No pin, no trigger, no state change:
    // the diagram holds its resting pose and globals.css stops its breathing.
    if (!track || !stage || reduced) {
      setValue((prev) => (prev.mode === "static" && !prev.line ? prev : UNPINNED));
      return;
    }

    let live = true;
    const measure = () => {
      if (!live) return;
      const vh = smallViewport();
      const height = stage.offsetHeight;
      const clear = navClearance();

      // The line has to clear the plate wherever the plate is sticky, which is
      // the stacked layout — and on a short window that is what decides it.
      const plate = stage.querySelector<HTMLElement>(".ch-plate");
      let line = Math.round(vh * FOCUS_FRACTION);
      if (plate && getComputedStyle(plate).position === "sticky") {
        const stuckAt = parseFloat(getComputedStyle(plate).top) || 0;
        line = Math.max(line, Math.round(stuckAt + plate.offsetHeight + LINE_CLEARANCE));
      }
      line = Math.min(line, vh - LINE_CLEARANCE);

      const fits = height + clear + FIT_AIR <= vh;
      const top = fits ? Math.max(clear, Math.round((vh - height) / 2)) : 0;
      if (fits) track.style.setProperty("--ch-stick-top", `${top}px`);

      const next: Stage = fits
        ? { mode: "scroll", top, height, line }
        : { ...UNPINNED, line };
      setValue((prev) =>
        prev.mode === next.mode &&
        prev.top === next.top &&
        prev.height === next.height &&
        prev.line === next.line
          ? prev
          : next,
      );
    };

    measure();
    // Every input to that measurement, watched: the stage's own height (font
    // swap, a CMS rewrite, and the 16px the plate gives back when the pin
    // lands) and the window's.
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      live = false;
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [track, stage, reduced]);

  return value;
}

/**
 * Which challenge the scroll is on — `null` before it reaches the first.
 *
 * Pinned, the timeline is the stage's sticky travel, but every number in it is
 * read off the TRACK: its layout top, its height, and the height of the hold
 * inside it. Nothing here may be measured from the stage itself, because the
 * stage is the sticky element — while it is stuck its rect IS the sticky offset,
 * so a refresh that lands mid-hold (a resize, a toolbar collapse, ScrollRefresh)
 * would re-anchor the start to wherever the reader happens to be and leave half
 * the hold blank. Heights and layout positions do not move when something
 * sticks; rects do.
 *
 *   start = track's layout top + how far the stage sits down it − its sticky offset
 *   end   = track's layout top + its height − (sticky offset + stage height)
 *
 * and "how far the stage sits down it" is `trackH − stageH − holdH`, which is 0
 * wide and a heading's height stacked. Unpinned the timeline is the list's
 * passage across the reading line instead. Either way one trigger, and the same
 * arithmetic on top of it: equal bands, one per challenge.
 *
 * Past the end the progress stays at 1, so the last challenge KEEPS the drawing
 * while the section leaves rather than the diagram snapping back to idle in
 * front of the reader. Below the start it is 0, which is idle — the section
 * arrives at rest, takes its first challenge on the first pixel of the walk, and
 * rests again if the reader scrolls back above it.
 */
function useScrolledRow(
  track: HTMLElement | null,
  stage: HTMLElement | null,
  list: HTMLElement | null,
  count: number,
  { mode, top, height, line }: Stage,
  reduced: boolean,
): number | null {
  const [row, setRow] = useState<number | null>(null);

  useEffect(() => {
    const pinned = mode === "scroll";
    if (reduced || !track || (pinned ? !stage : !list)) return;

    const apply = (p: number) =>
      setRow(p <= 0 ? null : Math.min(count - 1, Math.floor(p * count)));

    const holdHeight = () =>
      track.querySelector<HTMLElement>(".ch-hold")?.offsetHeight ?? 0;

    const st = ScrollTrigger.create({
      trigger: pinned ? track : list!,
      start: pinned
        ? () => layoutTop(track) + (track.offsetHeight - height - holdHeight()) - top
        : `top ${line}px`,
      end: pinned
        ? () => layoutTop(track) + track.offsetHeight - (top + height)
        : `bottom ${line}px`,
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
    // The elements are dependencies, not refs: the two layouts are two different
    // DOM trees, so crossing 1080px REPLACES the stage and the list. Held in a
    // ref, this effect would not re-run for that — the trigger would keep
    // measuring a detached node, which has a zero rect, which collapses start
    // and end onto each other and pins progress at 1. That is exactly what it
    // did: every narrow window that took the fallback arrived frozen on the last
    // challenge, because `mode` never changed there and nothing else told this
    // effect the DOM underneath it had been rebuilt.
  }, [track, stage, list, count, mode, top, height, line, reduced]);

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
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const [listEl, setListEl] = useState<HTMLUListElement | null>(null);
  const stacked = useMedia(STACKED);
  const reduced = useMedia(REDUCED);
  const stage = useStage(track, stageEl, reduced);
  const active = useHeld(useScrolledRow(track, stageEl, listEl, items.length, stage, reduced));

  const state: DiagramState =
    active === null ? "idle" : CHALLENGE_STATES[active % CHALLENGE_STATES.length];

  const diagram = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = diagram.current;
    if (state !== "conflict" || !el || reduced) return;
    let phase = 0;
    const id = setInterval(() => {
      phase ^= 1;
      el.setAttribute("data-phase", String(phase));
    }, CLASH_HALF_CYCLE_MS);
    return () => {
      clearInterval(id);
      el.removeAttribute("data-phase");
    };
  }, [state, reduced]);

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
          itself carries every challenge as text — and under «تقليل الحركة» the
          drawing does not change at all, so the sentence does not say it does. */}
      <p className="sr-only">
        رسم توضيحي: دائرتان متداخلتان تمثّلان طرفَي العلاقة، وفي منطقة تداخلهما قلب
        {reduced ? "." : " — ويتبدّل شكلهما مع كل تحدٍّ من القائمة أثناء التمرير."}
      </p>
    </div>
  );

  const rows = (
    <ul
      ref={setListEl}
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
      ref={setTrack}
      className="ch-track"
      data-ch={stage.mode}
      style={{ "--ch-count": items.length } as CSSProperties}
    >
      {stacked ? (
        <>
          {head}
          <div ref={setStageEl} className="ch-stage mt-8 flex flex-col gap-8">
            {plate}
            {rows}
          </div>
        </>
      ) : (
        <div
          ref={setStageEl}
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
