import type { CSSProperties, RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * The signature of قسم التعريف: ONE circle.
 *
 * Section 2 holds two circles in tension. Here they have resolved into a single
 * line whose stroke runs lilac → coral: both colours, one continuous stroke.
 *
 * Every state is driven by `data-state` alone; all the motion lives in
 * `app/globals.css` under `.mi-*`. What lives here is the geometry, and the
 * per-element constants that geometry implies.
 *
 * EACH STATE HAS TO ARGUE ITS مرتكز, not merely appear. Section 2 sets the
 * standard: ضعف التواصل breaks its strokes into travelling gaps, فتور العلاقة
 * drains coral to grey. A state that would suit any label is decoration. So:
 *
 *   منهج علميّ    points scattered inside the ring travel and land exactly ON
 *                 it — method is what turns scattered observation into a rule
 *   أدوات عملية   the ring resolves into six IDENTICAL segments, equal gaps,
 *                 each stepping out the same distance — equal parts evenly
 *                 spaced is a kit; uneven pieces drifting is a break
 *   خبرة ميدانية  faint tracings of the circle accumulate at slight offsets,
 *                 one after another — each a past case, the solid line their sum
 *
 * Converge, distribute, accumulate: three different KINDS of motion, so they
 * stay distinguishable in peripheral vision.
 *
 * TWO CONSTRAINTS SHAPE THE GEOMETRY:
 *
 * 1. Nothing here may touch `stroke-dasharray` / `stroke-dashoffset` on the
 *    main circle. `useSignatureScrub` in meet-instructor.tsx owns those
 *    imperatively, in DEVICE pixels, for the scroll-draw — see the long note
 *    there on why they cannot be authored declaratively. The states work on
 *    separate elements, so the two can never race.
 *
 * 2. Browsers clip `<svg>` at the viewBox, so NOTHING may exceed 100 units
 *    from the centre — in either its resting or its active position. Every
 *    figure below is derived and asserted at the bottom of this file rather
 *    than typed by hand: a first hand-picked scatter reached 110.7 and would
 *    have cut the points off against the box.
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

/** Furthest any element may sit from the centre before the viewBox clips it. */
const LIMIT = CENTRE;

const rad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => +n.toFixed(2);
const onCircle = (r: number, deg: number): [number, number] => [
  round(CENTRE + r * Math.cos(rad(deg))),
  round(CENTRE + r * Math.sin(rad(deg))),
];

// ---------------------------------------------------------------------------
// منهج علميّ — scattered points that resolve onto the ring
// ---------------------------------------------------------------------------

const POINT_R = 1.75;
const POINT_HOME_R = 97.5;

/**
 * Per point: how far IN from its home position it rests, and how far along the
 * tangent. Both are applied along the point's own radius, which is what keeps
 * every scattered position inside the box no matter how large the numbers look
 * — an outward component is what would clip. Varied so the cloud reads as
 * scatter rather than a uniform contraction.
 */
const POINT_SCATTER: [inward: number, tangent: number][] = [
  [22, 7],
  [13, -9],
  [26, 4],
  [17, 10],
  [11, -6],
  [24, -8],
  [15, 6],
  [28, -3],
  [12, 9],
  [19, -11],
];

const POINTS = POINT_SCATTER.map(([inward, tangent], i) => {
  const deg = i * 36;
  const [cx, cy] = onCircle(POINT_HOME_R, deg);
  const ux = Math.cos(rad(deg));
  const uy = Math.sin(rad(deg));
  // -radial * inward  +  tangent * jitter
  return {
    cx,
    cy,
    sx: round(-ux * inward - uy * tangent),
    sy: round(-uy * inward + ux * tangent),
  };
});

// ---------------------------------------------------------------------------
// أدوات عملية — the ring as six identical, evenly spaced segments
// ---------------------------------------------------------------------------

const SEG_R = 91;
const SEG_SPAN = 54; // six of these plus six 6° gaps = 360
const SEG_STEP = 7; // every segment steps out by exactly this much

const SEGMENTS = Array.from({ length: 6 }, (_, i) => {
  const from = i * 60 + 3;
  const [x1, y1] = onCircle(SEG_R, from);
  const [x2, y2] = onCircle(SEG_R, from + SEG_SPAN);
  const mid = from + SEG_SPAN / 2;
  return {
    // large-arc-flag 0 (span < 180°), sweep-flag 1 (increasing angle)
    d: `M ${x1} ${y1} A ${SEG_R} ${SEG_R} 0 0 1 ${x2} ${y2}`,
    dx: round(SEG_STEP * Math.cos(rad(mid))),
    dy: round(SEG_STEP * Math.sin(rad(mid))),
  };
});

// ---------------------------------------------------------------------------
// خبرة ميدانية — faint tracings that accumulate
// ---------------------------------------------------------------------------

const GHOST_R = 93;

/**
 * Offset centres, so the traces overlap rather than nest — nested rings read as
 * one target, overlapping ones as separate records of the same thing.
 *
 * Each also rests pulled back toward the centre along its own offset direction
 * and settles outward into place, so a trace arrives rather than switches on.
 */
const GHOSTS = [
  [-4, -2.5],
  [3.5, -4],
  [-2.5, 4],
  [4, 3],
].map(([ox, oy]) => {
  const len = Math.hypot(ox, oy);
  return {
    cx: CENTRE + ox,
    cy: CENTRE + oy,
    // toward the centre, 4 units
    sx: round((-ox / len) * 4),
    sy: round((-oy / len) * 4),
  };
});

// ---------------------------------------------------------------------------
// Clip assertions — cheap, and they run wherever this module is imported.
// ---------------------------------------------------------------------------

const reach = (dx: number, dy: number, r = 0) => Math.hypot(dx, dy) + r;

for (const p of POINTS) {
  const home = reach(p.cx - CENTRE, p.cy - CENTRE, POINT_R);
  const rest = reach(p.cx + p.sx - CENTRE, p.cy + p.sy - CENTRE, POINT_R);
  if (home > LIMIT || rest > LIMIT) {
    throw new Error(`Signature point escapes the viewBox: home ${home}, rest ${rest}`);
  }
}
if (SEG_R + SEG_STEP > LIMIT) throw new Error("Signature segments escape the viewBox");
for (const g of GHOSTS) {
  const home = reach(g.cx - CENTRE, g.cy - CENTRE, GHOST_R);
  const rest = reach(g.cx + g.sx - CENTRE, g.cy + g.sy - CENTRE, GHOST_R);
  if (home > LIMIT || rest > LIMIT) {
    throw new Error(`Signature ghost escapes the viewBox: home ${home}, rest ${rest}`);
  }
}

// ---------------------------------------------------------------------------

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

      {/* خبرة ميدانية — behind the ring, so they read as what it was built from.
          The stagger that makes them accumulate is in globals.css. */}
      <g className="mi-ghosts">
        {GHOSTS.map((g, i) => (
          <circle
            key={i}
            className="mi-ghost"
            cx={g.cx}
            cy={g.cy}
            r={GHOST_R}
            stroke="var(--color-lilac)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ "--mi-sx": `${g.sx}px`, "--mi-sy": `${g.sy}px` } as CSSProperties}
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
        strokeOpacity="0.35"
        strokeWidth="1.25"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* أدوات عملية */}
      <g className="mi-segs">
        {SEGMENTS.map((s, i) => (
          <path
            key={i}
            className="mi-seg"
            d={s.d}
            stroke="url(#instructor-signature)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            // Inline rather than an nth-child table in globals.css (the shape
            // `.ch-dots` uses): these are DERIVED from the same numbers that
            // place the segment, so keeping them together is what stops the two
            // drifting apart. The behaviour still lives entirely in the CSS.
            style={{ "--mi-dx": `${s.dx}px`, "--mi-dy": `${s.dy}px` } as CSSProperties}
          />
        ))}
      </g>

      {/* منهج علميّ — drawn last so the points land on top of the line. */}
      <g className="mi-points">
        {POINTS.map((p, i) => (
          <circle
            key={i}
            className="mi-point"
            cx={p.cx}
            cy={p.cy}
            r={POINT_R}
            fill="var(--color-lilac)"
            style={{ "--mi-sx": `${p.sx}px`, "--mi-sy": `${p.sy}px` } as CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}
