import { cn } from "@/lib/utils";

/**
 * The signature diagram of قسم التحديات: two overlapping sources — two people —
 * and the warm interference where they meet.
 *
 * Every state is driven by `data-state` alone; all the motion lives in
 * `app/globals.css` under `.ch-*`, so this file stays two circles, one heart,
 * a few dots. The two ghost outlines and the six pressure dots are always in
 * the tree at opacity 0 — that is what lets a state change animate FROM
 * whatever is currently on screen instead of mounting into place.
 *
 * Decorative: the section carries a visually-hidden live region that says what
 * this is doing, so the SVG itself is aria-hidden.
 */

export const CHALLENGE_STATES = [
  "communication",
  "conflict",
  "choice",
  "distance",
  "anxiety",
] as const;

export type ChallengeState = (typeof CHALLENGE_STATES)[number];
export type DiagramState = ChallengeState | "idle";

export function ChallengesDiagram({
  state,
  className,
  ref,
}: {
  state: DiagramState;
  className?: string;
  ref?: React.Ref<SVGSVGElement>;
}) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 340"
      data-state={state}
      className={cn("ch-diagram", className)}
      fill="none"
      aria-hidden="true"
    >
      {/* The warm interference: the lens where the two circles meet, drawn as
          the two arcs that bound it. Deliberately NOT a clip-path of one circle
          by the other — Chrome reports a CSS transform on a clipPath child in
          getComputedStyle but does not apply it to the clip geometry, so the
          overlap stayed behind when the circles moved. Its own scale per state
          is in globals.css, keyed to the same numbers the circles move by. */}
      <path
        className="ch-lens"
        d="M200 80.7 A100 100 0 0 1 200 259.3 A100 100 0 0 1 200 80.7 Z"
      />

      {/* حيرة الاختيار — faint alternatives of the second source */}
      <circle className="ch-ghost ch-ghost-1" cx="245" cy="170" r="100" stroke="var(--color-coral)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <circle className="ch-ghost ch-ghost-2" cx="245" cy="170" r="100" stroke="var(--color-coral)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />

      <circle className="ch-a ch-stroke" cx="155" cy="170" r="100" stroke="var(--color-aubergine)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <circle className="ch-b ch-stroke" cx="245" cy="170" r="100" stroke="var(--color-coral)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />

      <path
        className="ch-heart"
        d="M200 154 c -10 -17 -35 -9 -35 11 c 0 17 23 29 35 38 c 12 -9 35 -21 35 -38 c 0 -20 -25 -28 -35 -11 z"
        stroke="var(--color-coral)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="var(--color-coral)"
        fillOpacity="0.12"
      />

      {/* القلق والضغوط — six dots that press inward; order matches the
          per-dot direction vars in globals.css */}
      <g className="ch-dots">
        <circle cx="78" cy="62" r="6" fill="var(--color-aubergine)" />
        <circle cx="200" cy="34" r="6" fill="var(--color-coral)" />
        <circle cx="322" cy="62" r="6" fill="var(--color-aubergine)" />
        <circle cx="322" cy="278" r="6" fill="var(--color-coral)" />
        <circle cx="200" cy="306" r="6" fill="var(--color-aubergine)" />
        <circle cx="78" cy="278" r="6" fill="var(--color-coral)" />
      </g>
    </svg>
  );
}
