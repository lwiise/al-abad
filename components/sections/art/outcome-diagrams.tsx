import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The four diagrams of «ماذا ستكتسب؟» — one per outcome, each drawing what its
 * outcome actually means.
 *
 * Same grammar as the step diagrams next door and the challenges diagram in
 * section two: a 400 × 340 canvas, 1.25px non-scaling strokes, plum for
 * structure and coral for the moment that matters, no icon set and no library.
 * All the motion lives in `app/globals.css` under `.out-*`, applied only while
 * the outcome is the one on screen.
 *
 * Every diagram here is driven by ONE number, `--art-on` — how far arrived it
 * is — and each uses the two idioms documented with the property: parts in
 * sequence via `clamp(0, --art-on * N - k, 1)`, and paths drawn via
 * `stroke-dashoffset` over `pathLength="100"`. So a single ramp writes three
 * lines, draws three roots, closes three stitches. The resting pose (no
 * animation) is the outcome achieved, which is what reduced motion is left
 * with.
 *
 * Decorative: the outcome is written out beneath each one, so the SVGs are
 * aria-hidden.
 */

export type OutcomeArtProps = { active?: boolean; className?: string };

function Frame({
  active,
  className,
  children,
}: OutcomeArtProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 340"
      data-active={active ? "true" : undefined}
      className={cn("art", className)}
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   1 — مهارات تواصل أعمق
   One says, the other hears, and the channel between them — the same one that
   broke into travelling dashes under ضعف التواصل in section two — closes back
   into a solid line. Each bubble writes its lines from the right, one after
   another, off its own single number.
   ------------------------------------------------------------------------ */

/* Each bubble is ONE closed path — rounded box with the tail cut into its
   edge — so nothing has to be drawn over a stroke to hide a join. Written
   clockwise from the top-left corner, which is why every arc has sweep 1. */
const SAID_D =
  "M 200 14 H 348 A 24 24 0 0 1 372 38 V 88 A 24 24 0 0 1 348 112 " +
  "H 248 L 232 136 L 224 112 H 200 A 24 24 0 0 1 176 88 V 38 A 24 24 0 0 1 200 14 Z";
const HEARD_D =
  "M 48 202 H 160 L 168 178 L 184 202 H 196 A 24 24 0 0 1 220 226 V 276 " +
  "A 24 24 0 0 1 196 300 H 48 A 24 24 0 0 1 24 276 V 226 A 24 24 0 0 1 48 202 Z";

/** Lines run from the bubble's right inset leftward — Arabic starts there. */
const SAID_LINES = [
  { y: 42, from: 348, to: 216 },
  { y: 64, from: 348, to: 244 },
  { y: 86, from: 348, to: 272 },
];
const HEARD_LINES = [
  { y: 230, from: 196, to: 64 },
  { y: 252, from: 196, to: 92 },
  { y: 274, from: 196, to: 120 },
];

function Bubble({
  cls,
  d,
  lines,
  stroke,
}: {
  cls: string;
  d: string;
  lines: { y: number; from: number; to: number }[];
  stroke: string;
}) {
  return (
    <g className={cls}>
      <path d={d} fill="var(--color-background)" />
      <path className="out-bubble-wash" d={d} fill="var(--color-lilac)" />
      <path
        d={d}
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {lines.map((line, i) => (
        <path
          key={line.y}
          className={`out-line out-line-${i + 1}`}
          d={`M ${line.from} ${line.y} H ${line.to}`}
          stroke="var(--color-neutral-300)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export function TalkArt(props: OutcomeArtProps) {
  return (
    <Frame {...props}>
      {/* The channel: dashed while it has only gone one way, solid once it has
          gone both. Section two broke these strokes INTO dashes under ضعف
          التواصل; this is that run backwards. */}
      <path
        className="out-channel"
        d="M 228 141 L 172 173"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      <Bubble
        cls="out-bubble out-said"
        d={SAID_D}
        lines={SAID_LINES}
        stroke="var(--color-primary)"
      />
      <Bubble
        cls="out-bubble out-heard"
        d={HEARD_D}
        lines={HEARD_LINES}
        stroke="var(--color-coral)"
      />

      {/* What crosses. Parked at the speaking end when nothing is moving. */}
      <circle className="out-msg" cx="228" cy="141" r="7" fill="var(--color-coral)" />
    </Frame>
  );
}

/* ---------------------------------------------------------------------------
   2 — فهمٌ لدوافع السلوك
   What you see never changes: one shape, above the line, the same at the start
   and at the end. What understanding adds is everything under it — three roots
   drawing down to what is actually driving it.
   ------------------------------------------------------------------------ */

/* Each root carries a branchlet off its own midpoint — three bare curves from
   one point read as legs, not as roots. */
const ROOTS = [
  {
    d: "M 199 152 C 192 186 156 196 108 228",
    branch: "M 169 191 C 162 206 158 216 152 234",
    cx: 108,
    cy: 228,
  },
  {
    d: "M 200 152 C 204 194 202 232 200 280",
    branch: "M 202 214 C 212 228 224 236 238 246",
    cx: 200,
    cy: 280,
  },
  {
    d: "M 201 152 C 208 186 244 196 292 228",
    branch: "M 231 191 C 238 206 242 216 248 234",
    cx: 292,
    cy: 228,
  },
];

export function RootsArt(props: OutcomeArtProps) {
  return (
    <Frame {...props}>
      {/* The surface — what behaviour is read off. */}
      <path
        d="M 36 150 H 364"
        stroke="var(--color-border-strong)"
        strokeWidth="1.25"
        strokeDasharray="2 10"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      <g className="out-under">
        {/* Flat along the surface and bulging down from it — an ellipse
            centred below the line still rises through it and rubs out the
            middle of the dashes. */}
        <path
          className="out-soil"
          d="M 32 152 A 168 136 0 0 0 368 152 Z"
          fill="var(--color-lilac)"
        />
        {/* One strand = one root and what it ends in, so both read the same
            number and the dot can wait for its own root to arrive. */}
        {ROOTS.map((root, i) => (
          <g key={root.cx} className={`out-strand out-strand-${i + 1}`}>
            <path
              className="out-root"
              d={root.d}
              pathLength="100"
              stroke="var(--color-coral)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Same number, second half of it: a branchlet that drew at the
                same time as its root would float unattached until the root
                caught up with where it leaves from. */}
            <path
              className="out-root out-branch"
              d={root.branch}
              pathLength="100"
              stroke="var(--color-coral)"
              strokeWidth="1.75"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle className="out-motive" cx={root.cx} cy={root.cy} r="9" fill="var(--color-coral)" />
          </g>
        ))}
      </g>

      {/* The behaviour itself, unchanged throughout — that is the point. A
          leaf rather than a circle: three curves under a disc read as legs,
          under a leaf they read as roots. */}
      <path
        d="M 200 124 V 152"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 200 30 C 244 64 244 106 200 126 C 156 106 156 64 200 30 Z"
        fill="var(--color-lilac)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 200 46 V 120"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        strokeOpacity="0.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </Frame>
  );
}

/* ---------------------------------------------------------------------------
   3 — أدوات عملية لحل الخلافات
   One shape, split. The two halves carry the SAME jagged seam, so closing them
   interlocks exactly — the disagreement does not disappear, it is held. Three
   clasps close it, one after another, off the one number.
   ------------------------------------------------------------------------ */

/** Shared by both halves — read top to bottom, it is each one's inner edge. */
const SEAM = "L 178 228 L 222 188 L 178 148 L 222 108";

const CLASPS = [118, 168, 218];

export function MendArt(props: OutcomeArtProps) {
  return (
    <Frame {...props}>
      <g className="out-mend">
        <path
          className="out-half out-half-a"
          d={`M 200 68 A 100 100 0 0 0 200 268 ${SEAM} Z`}
          fill="var(--color-lilac)"
          stroke="var(--color-primary)"
          strokeWidth="1.25"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="out-half out-half-b"
          d={`M 200 68 A 100 100 0 0 1 200 268 ${SEAM} Z`}
          fill="var(--color-background)"
          stroke="var(--color-coral)"
          strokeWidth="1.25"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {CLASPS.map((y, i) => (
          <g key={y} className={`out-clasp out-clasp-${i + 1}`}>
            <path
              d={`M 164 ${y} H 236`}
              stroke="var(--color-coral)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="164" cy={y} r="7" fill="var(--color-coral)" />
            <circle cx="236" cy={y} r="7" fill="var(--color-coral)" />
          </g>
        ))}
      </g>
    </Frame>
  );
}

/* ---------------------------------------------------------------------------
   4 — ثقة في قراراتك الزوجية
   A needle that swings wide, narrows, and settles — and the ring closing
   around it as it does. Confidence drawn as steadiness, not as certainty.
   ------------------------------------------------------------------------ */

const DIAL = { cx: 200, cy: 170, r: 104 };

/** Twelve marks; the four cardinals reach further in. */
function tick(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const inner = DIAL.r - (angle % 90 === 0 ? 18 : 10);
  return [
    `M ${(DIAL.cx + cos * DIAL.r).toFixed(1)} ${(DIAL.cy + sin * DIAL.r).toFixed(1)}`,
    `L ${(DIAL.cx + cos * inner).toFixed(1)} ${(DIAL.cy + sin * inner).toFixed(1)}`,
  ].join(" ");
}

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export function CompassArt(props: OutcomeArtProps) {
  return (
    <Frame {...props}>
      {/* Inside the dial, not beside it: `--art-on` is what settles this whole
          diagram and it is declared on .out-dial, so anything reading it has
          to be a descendant. First child, so it stays behind the face. */}
      <g className="out-dial">
        <circle className="out-glow" cx={DIAL.cx} cy={DIAL.cy} r="96" fill="var(--color-coral)" />
        <circle
          cx={DIAL.cx}
          cy={DIAL.cy}
          r={DIAL.r}
          stroke="var(--color-border-strong)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        {TICKS.map((angle) => (
          <path
            key={angle}
            d={tick(angle)}
            stroke="var(--color-primary)"
            strokeWidth="1.25"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* The ring closes as the needle settles. */}
        <circle
          className="out-arc"
          cx={DIAL.cx}
          cy={DIAL.cy}
          r={DIAL.r}
          pathLength="100"
          stroke="var(--color-coral)"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(-90 ${DIAL.cx} ${DIAL.cy})`}
        />

        <g className="out-needle">
          <path
            className="out-needle-head"
            d="M 200 84 L 216 170 L 184 170 Z"
            fill="var(--color-coral)"
            fillOpacity="0.9"
            stroke="var(--color-coral)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M 200 256 L 216 170 L 184 170 Z"
            fill="var(--color-background)"
            stroke="var(--color-primary)"
            strokeWidth="1.25"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        <circle
          cx={DIAL.cx}
          cy={DIAL.cy}
          r="9"
          fill="var(--color-background)"
          stroke="var(--color-primary)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </Frame>
  );
}

/** In section order. Cycled if the CMS ever holds more outcomes than there are. */
export const OUTCOME_ART = [TalkArt, RootsArt, MendArt, CompassArt];
