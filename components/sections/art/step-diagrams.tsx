import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The three diagrams of «كيف تبدأ؟» — one per step, each drawing what its step
 * actually says.
 *
 * Same grammar as the challenges diagram in `art/challenges-diagram.tsx`:
 * 1.25px non-scaling strokes, plum for structure and coral for the moment that
 * matters, no icon set, no library. All the motion lives in `app/globals.css`
 * under `.hiw-*` and is applied ONLY while the step is the one on screen, so
 * every diagram starts from its first frame each time its step comes round.
 *
 * The one number that runs through all three is `--art-on`: how "arrived" a
 * part is — chosen, watched, achieved. Lift, coral fill and the check are all
 * derived from it, so a keyframe that moves one number moves the whole look.
 * Each diagram's RESTING pose (no animation) is its finished state, which is
 * what a reader with reduced motion or without JS is left with.
 *
 * Decorative: the step's title and description carry the meaning in text, so
 * every SVG here is aria-hidden.
 */

export type StepArtProps = { active?: boolean; className?: string };

/** Shared canvas. 400 × 340 is the challenges diagram's box, deliberately. */
function Frame({
  active,
  className,
  children,
}: StepArtProps & { children: ReactNode }) {
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
   1 — اختر دورتك
   Three courses side by side; attention travels along them, right to left,
   the direction the page is read. Whichever it rests on lifts, warms to lilac
   and takes the check.
   ------------------------------------------------------------------------ */

/** Laid out right → left: option 1 is the rightmost, i.e. the first read. */
const OPTION_X = [274, 150, 26];

function Option({ index, x }: { index: number; x: number }) {
  return (
    <g className={`hiw-opt hiw-opt-${index}`}>
      <rect
        className="hiw-opt-ring"
        x={x - 7}
        y="63"
        width="114"
        height="190"
        rx="24"
        stroke="var(--color-coral)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={x}
        y="70"
        width="100"
        height="176"
        rx="16"
        fill="var(--color-background)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      {/* Inset by a unit so the wash never creeps over the card's own edge. */}
      <rect
        className="hiw-opt-wash"
        x={x + 1}
        y="71"
        width="98"
        height="174"
        rx="15"
        fill="var(--color-lilac)"
      />
      <circle
        cx={x + 50}
        cy="122"
        r="22"
        fill="var(--color-lilac)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${x + 16} 180 H ${x + 84}`}
        stroke="var(--color-neutral-300)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d={`M ${x + 30} 206 H ${x + 70}`}
        stroke="var(--color-neutral-300)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Top-end corner — the side the number badge sits on elsewhere on the
          page. The gap between cards is wide enough that it never lands on
          its neighbour. */}
      <g className="hiw-opt-check">
        <circle cx={x} cy="70" r="12" fill="var(--color-coral)" />
        <path
          d={`M ${x - 5.5} 70 l 4 4.4 l 7 -8.8`}
          stroke="var(--color-background)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

export function ChooseArt(props: StepArtProps) {
  return (
    <Frame {...props}>
      {/* Attention, as an underline that slides between the three. Behind the
          cards in paint order so a lifted card always sits over it. */}
      <rect
        className="hiw-pick"
        x={OPTION_X[0]}
        y="268"
        width="100"
        height="5"
        rx="2.5"
        fill="var(--color-coral)"
      />
      {OPTION_X.map((x, i) => (
        <Option key={x} index={i + 1} x={x} />
      ))}
    </Frame>
  );
}

/* ---------------------------------------------------------------------------
   2 — سجّل وتعلّم على راحتك
   A lesson playing, the ring filling at whatever pace, and the lessons behind
   it ticking off one after another.
   ------------------------------------------------------------------------ */

/** y of each lesson row, and where its line ends — uneven, like real titles. */
const LESSONS = [
  { y: 248, to: 150 },
  { y: 283, to: 128 },
  { y: 318, to: 176 },
];

function Lesson({ index, y, to }: { index: number; y: number; to: number }) {
  return (
    <g className={`hiw-lesson hiw-lesson-${index}`}>
      <path
        className="hiw-lesson-line"
        d={`M 322 ${y} H ${to}`}
        stroke="var(--color-neutral-300)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="344"
        cy={y}
        r="13"
        fill="var(--color-background)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <circle className="hiw-lesson-fill" cx="344" cy={y} r="13" fill="var(--color-coral)" />
      <path
        className="hiw-lesson-check"
        d={`M 337.5 ${y} l 4.4 5 l 8.6 -10`}
        stroke="var(--color-background)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function LearnArt(props: StepArtProps) {
  return (
    <Frame {...props}>
      <rect
        x="44"
        y="28"
        width="312"
        height="184"
        rx="20"
        fill="var(--color-background)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 44 68 H 356"
        stroke="var(--color-border-strong)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="336" cy="48" r="4" fill="var(--color-neutral-300)" />
      <circle cx="320" cy="48" r="4" fill="var(--color-neutral-300)" />
      <circle cx="304" cy="48" r="4" fill="var(--color-neutral-300)" />

      {/* `pathLength="100"` so the fill is written as a percentage rather than
          as this circle's circumference — the geometry can change without the
          keyframes having to be recomputed. Rotated so it starts at the top. */}
      <circle cx="200" cy="142" r="48" stroke="var(--color-border-strong)" strokeWidth="6" />
      <circle
        className="hiw-ring"
        cx="200"
        cy="142"
        r="48"
        pathLength="100"
        stroke="var(--color-coral)"
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 200 142)"
      />
      <path
        className="hiw-play"
        d="M 189 127 L 219 142 L 189 157 Z"
        fill="var(--color-coral)"
        fillOpacity="0.14"
        stroke="var(--color-coral)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {LESSONS.map((lesson, i) => (
        <Lesson key={lesson.y} index={i + 1} {...lesson} />
      ))}
    </Frame>
  );
}

/* ---------------------------------------------------------------------------
   3 — طبّق وحقّق نتائج
   The climb: three practical steps met one by one, and what it is all for
   waiting at the top — the same heart the challenges diagram watched shrink.
   ------------------------------------------------------------------------ */

/** On the climb, at 0 · ⅓ · ⅔ of it. The heart holds the end. */
const MILESTONES = [
  { cx: 336, cy: 288 },
  { cx: 244, cy: 228 },
  { cx: 166, cy: 166 },
];

function Milestone({ index, cx, cy }: { index: number; cx: number; cy: number }) {
  return (
    <g className={`hiw-mark hiw-mark-${index}`}>
      <circle
        cx={cx}
        cy={cy}
        r="14"
        fill="var(--color-background)"
        stroke="var(--color-primary)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <circle className="hiw-mark-fill" cx={cx} cy={cy} r="14" fill="var(--color-coral)" />
      <path
        className="hiw-mark-check"
        d={`M ${cx - 6.5} ${cy} l 4.4 5 l 8.6 -10`}
        stroke="var(--color-background)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** A four-point star, as a diamond with its sides pulled in. */
function sparkle(cx: number, cy: number, r: number) {
  const q = r * 0.2;
  return [
    `M ${cx} ${cy - r}`,
    `Q ${cx + q} ${cy - q} ${cx + r} ${cy}`,
    `Q ${cx + q} ${cy + q} ${cx} ${cy + r}`,
    `Q ${cx - q} ${cy + q} ${cx - r} ${cy}`,
    `Q ${cx - q} ${cy - q} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
}

const SPARKS = [
  { cx: 158, cy: 76, r: 11 },
  { cx: 52, cy: 58, r: 8 },
  { cx: 142, cy: 134, r: 7 },
];

export function ApplyArt(props: StepArtProps) {
  return (
    <Frame {...props}>
      <path
        d="M 40 316 H 360"
        stroke="var(--color-border-strong)"
        strokeWidth="1.25"
        strokeDasharray="2 10"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Ends at the heart's lower edge, so the climb arrives rather than
          stopping short. Normalised length again — see the ring above. */}
      <path
        className="hiw-climb"
        d="M 336 288 C 306 278 274 258 244 228 C 218 202 194 190 166 166 C 148 150 130 134 116 116"
        pathLength="100"
        stroke="var(--color-primary)"
        strokeWidth="2.25"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {MILESTONES.map((mark, i) => (
        <Milestone key={mark.cx} index={i + 1} {...mark} />
      ))}

      {/* The heart is the challenges diagram's, moved: every segment after the
          first is relative, so the whole shape travels with its `M`. */}
      <g className="hiw-summit">
        {/* The arrival needs weight, or the end of the climb is the thinnest
            thing on the canvas. Coral at a tenth, so it warms rather than
            fills. */}
        <circle className="hiw-halo" cx="100" cy="96" r="54" fill="var(--color-coral)" />
        <path
          className="hiw-heart"
          d="M100 72 c -10 -17 -35 -9 -35 11 c 0 17 23 29 35 38 c 12 -9 35 -21 35 -38 c 0 -20 -25 -28 -35 -11 z"
          stroke="var(--color-coral)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          fill="var(--color-coral)"
          fillOpacity="0.12"
        />
        {SPARKS.map((spark, i) => (
          <path
            key={spark.cx}
            className={`hiw-spark hiw-spark-${i + 1}`}
            d={sparkle(spark.cx, spark.cy, spark.r)}
            fill="var(--color-coral)"
          />
        ))}
      </g>
    </Frame>
  );
}

/** In step order. Cycled if the CMS ever holds more steps than there are. */
export const STEP_ART = [ChooseArt, LearnArt, ApplyArt];
