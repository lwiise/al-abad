import type { RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * The signature of قسم التعريف: ONE circle.
 *
 * Section 2 holds two circles in tension. Here they have resolved into a single
 * line whose stroke runs lilac → coral: both colours, one continuous stroke.
 *
 * Every state is driven by `data-state` alone; all the motion lives in
 * `app/globals.css` under `.mi-*`, so this file stays one circle plus the three
 * pieces of satellite geometry the مرتكزات reveal. All of that geometry is
 * ALWAYS in the tree at opacity 0 — that is what lets a state change animate
 * FROM whatever is currently on screen instead of mounting into place.
 *
 * TWO CONSTRAINTS SHAPE THE GEOMETRY:
 *
 * 1. Nothing here may touch `stroke-dasharray` / `stroke-dashoffset` on the
 *    main circle. `useSignatureScrub` in meet-instructor.tsx owns those
 *    imperatively, in DEVICE pixels, for the scroll-draw — see the long note
 *    there on why they cannot be authored declaratively. The states work on
 *    separate elements, so the two can never race.
 *
 * 2. Every satellite element sits INSIDE r=99. Browsers clip `<svg>` at the
 *    viewBox, so anything at a larger radius would hard-cut against the box
 *    rather than against the container the way the main circle deliberately
 *    does. Ticks point inward, rings contract, arcs rotate rather than expand.
 *
 * Decorative: the section carries a visually-hidden live region that says what
 * this is doing, so the SVG itself is aria-hidden.
 */

export const INSTRUCTOR_STATES = ["method", "tools", "field"] as const;

export type InstructorState = (typeof INSTRUCTOR_STATES)[number];
export type SignatureState = InstructorState | "idle";

/**
 * Geometry lives here, not in the consumer: useSignatureScrub converts the
 * circle's user-space circumference into device pixels and needs both numbers
 * to agree with what is actually drawn.
 */
export const VIEWBOX = 200;
export const RADIUS = 99;
const CENTRE = VIEWBOX / 2;

/** منهج علميّ — twelve radial marks, a measured scale rather than a plain ring. */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x1: +(CENTRE + 84 * cos).toFixed(2),
    y1: +(CENTRE + 84 * sin).toFixed(2),
    x2: +(CENTRE + 92 * cos).toFixed(2),
    y2: +(CENTRE + 92 * sin).toFixed(2),
  };
});

/**
 * أدوات عملية — the ring as three separable segments.
 *
 * Each spans 116° with a 4° gap, so together they read as the closed circle
 * until the state rotates them apart. They rotate rather than translate
 * outward: rotation keeps every point at r=99 and so cannot clip (see
 * constraint 2 above).
 */
const ARCS = [
  "M 100 1 A 99 99 0 0 1 188.98 143.4",
  "M 185.74 149.5 A 99 99 0 0 1 17.93 155.36",
  "M 14.26 149.5 A 99 99 0 0 1 93.09 1.24",
];

export function InstructorSignature({
  state,
  circleRef,
  className,
}: {
  state: SignatureState;
  circleRef?: RefObject<SVGCircleElement | null>;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      data-state={state}
      className={cn("mi-signature", className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="instructor-signature" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--color-lilac)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-coral)" }} />
        </linearGradient>
      </defs>

      {/* خبرة ميدانية — traces that contract inward as accumulated layers.
          Start life exactly on the main circle so they emerge from it. */}
      <circle
        className="mi-ring mi-ring-1"
        cx={CENTRE}
        cy={CENTRE}
        r={RADIUS}
        stroke="var(--color-lilac)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        className="mi-ring mi-ring-2"
        cx={CENTRE}
        cy={CENTRE}
        r={RADIUS}
        stroke="var(--color-lilac)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* منهج علميّ */}
      <g className="mi-ticks">
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="var(--color-lilac)"
            strokeWidth="1.25"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* No stroke-dasharray here on purpose: the circle renders CLOSED for
          SSR, no-JS and reduced motion, and only useSignatureScrub adds the
          dash. See the note there on why the dash cannot be authored. */}
      <circle
        ref={circleRef}
        className="mi-circle"
        cx={CENTRE}
        cy={CENTRE}
        r={RADIUS}
        // rotate -90° so the dash origin (3 o'clock) moves to the top; the
        // stroke then grows clockwise from there.
        transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
        stroke="url(#instructor-signature)"
        strokeWidth="1.25"
        strokeOpacity="0.35"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* أدوات عملية — drawn last so the segments read above the ring they
          separate out of. */}
      <g className="mi-arcs">
        {ARCS.map((d, i) => (
          <path
            key={i}
            className="mi-arc"
            d={d}
            stroke="url(#instructor-signature)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
