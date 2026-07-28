"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CHALLENGE_STATES,
  ChallengesDiagram,
  type DiagramState,
} from "./art/challenges-diagram";
import { HeadingRule } from "./section";

/** Desktop: how long the diagram holds a state after the pointer leaves. */
const RETURN_TO_IDLE_MS = 400;

/** Below this the diagram sits above the list and sticks while the list scrolls. */
const STACKED = "(max-width: 1079.98px)";

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
 * What the diagram is doing, in Arabic, for people who cannot see it. Keyed by
 * state rather than by label so it survives an editor rewording the challenges
 * in the CMS; the label itself is read out alongside it.
 */
const DIAGRAM_DESCRIPTION: Record<DiagramState, string> = {
  idle: "دائرتان متداخلتان تتنفّسان بهدوء، وفي منطقة التداخل قلب صغير.",
  communication: "خطّا الدائرتين يتقطّعان وتسير الفجوات ببطء، ومنطقة التداخل تبهت.",
  conflict: "الدائرتان تتقاربان وتتباعدان في تكرار سريع، والقلب يرتجف.",
  choice: "الدائرة الثانية تنقسم إلى ثلاثة أطياف باهتة، فتصبح منطقة التداخل غامضة.",
  distance: "لون منطقة التداخل يفقد دفأه، والدائرتان تنجرفان حتى يكاد التداخل يختفي، والقلب يصغر.",
  anxiety: "ست نقاط تظهر خارج الدائرتين وتضغط إلى الداخل حتى تنضغط الدائرتان قليلاً.",
};

/** The layout is external state, so read it as such rather than in an effect. */
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

export function ChallengesBoard({
  items,
  heading,
  lede,
}: {
  items: string[];
  heading: string;
  lede: string;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const stacked = useStackedLayout();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };

  useEffect(() => clearIdleTimer, []);

  const hold = useCallback((index: number) => {
    clearIdleTimer();
    setChosen(index);
  }, []);

  const release = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => setChosen(null), RETURN_TO_IDLE_MS);
  }, []);

  // Stacked, the diagram is always on screen, so nothing chosen means the first
  // challenge. On desktop the section rests in idle until a pointer or the
  // keyboard reaches a row.
  const active = chosen ?? (stacked ? 0 : null);

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
          match the section's band (lilac), or the diagram sits in a visible
          rectangle as the list scrolls under it. */}
      <div className="sticky top-20 z-10 -mx-2 bg-surface-strong px-2 pb-4 min-[1080px]:static min-[1080px]:z-auto min-[1080px]:mx-0 min-[1080px]:col-start-2 min-[1080px]:row-start-1 min-[1080px]:row-end-3 min-[1080px]:self-center min-[1080px]:px-0 min-[1080px]:pb-0">
        {/* Sized in globals.css, not with responsive utilities: the 1080px
            breakpoint has to be an arbitrary variant, and Tailwind orders those
            ahead of the named ones, so `sm:` would win at desktop widths. */}
        <ChallengesDiagram state={state} ref={diagram} />
      </div>

      <ul className="divide-y divide-border-strong border-y border-border-strong min-[1080px]:col-start-1 min-[1080px]:row-start-2">
        {items.map((item, i) => {
          const isActive = active === i;
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={isActive}
                className="ch-row flex w-full items-center gap-4 py-4 text-start"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") hold(i);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") release();
                }}
                onFocus={() => hold(i)}
                onClick={() => hold(i)}
              >
                {/* Echoes the diagram's circles: an outline that fills when the
                    row drives the diagram. */}
                <span className="ch-marker size-4 shrink-0 rounded-full border-2" aria-hidden="true" />
                <span className="ch-label text-lg font-medium">{item}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {active === null
          ? DIAGRAM_DESCRIPTION.idle
          : `${items[active]}: ${DIAGRAM_DESCRIPTION[state]}`}
      </p>
    </div>
  );
}
