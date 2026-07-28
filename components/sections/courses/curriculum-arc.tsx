import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * The signature: one circle, four arcs
 * ============================================================================
 *
 * The flagship carries the full closed circle — الشاملة, the comprehensive one.
 * Each of the other four carries a single 90° arc of that same circle: quadrant
 * 0 spans 0–90°, 1 spans 90–180°, 2 spans 180–270°, 3 spans 270–360°. Same
 * radius, same stroke, same box, same anchoring — laid over each other the four
 * would close the circle. It is never labelled or explained in copy.
 *
 * GEOMETRY. One `<circle>` with `pathLength={360}`, so dash units read as
 * degrees: a 90-unit dash is a quadrant. The quadrant is selected by ROTATING
 * the circle rather than by chasing `stroke-dashoffset` — rotating a circle
 * about its centre maps to itself, so every card draws the identical circle and
 * only the visible segment moves. It also keeps the dash inside [0°, 102°] of
 * the path, which a dashoffset would have wrapped past the path start.
 *
 * CROP. The circle fills 0.92 of a box taller than the cards, so each card
 * clips the top and bottom and leaves the east and west caps showing. Every
 * quadrant therefore keeps one end inside the card, which is what makes the
 * hover extension readable instead of clipped away.
 *
 * HOVER. The dash grows 90° → 102° and the whole arc turns back 6°, so it gains
 * 6° at each end — 12° in total, and visible whichever end the card shows. The
 * flagship's circle is already closed, so it only lifts. 320ms on the section's
 * curve; reduced motion renders the arc at its extended length with no
 * transition at all.
 *
 * STROKE WEIGHT. 1.25px at every breakpoint — but set in user units rather than
 * with `vector-effect: non-scaling-stroke`. Non-scaling-stroke moves the whole
 * stroke, dash pattern included, into screen space: the dash then measures in
 * device pixels against the circle's on-screen circumference instead of the
 * `pathLength` scale, so 90 stopped meaning 90°. Measured in Chrome at the lg
 * box it drew a 39° arc plus a second phantom segment at 195–234° where the
 * pattern wrapped. Dividing 1.25 by each box's scale keeps the rendered weight
 * identical and leaves dashing in user space, where a degree is a degree.
 */

const BOX = 200;
const CENTRE = BOX / 2;
const RADIUS = 92; // 0.92 × the box across — big enough that the card always crops it
const EXTEND = 12; // total hover growth in degrees, split across the arc's two ends
// The 90° sweep itself lives in the class list below as `[stroke-dasharray:90_360]`
// (102 on hover): Tailwind reads source text, so those cannot be interpolated.

/**
 * Box size — one shared radius per breakpoint, identical on all five cards.
 *
 * Centred with `inset-0 m-auto` rather than a flex/grid centre: the box is
 * deliberately taller than the cards, and an overflowing grid item falls back to
 * start alignment, which quietly pushed the circle off-centre. Auto margins
 * split the negative free space evenly, so it overflows symmetrically — and
 * unlike a translate it needs no RTL special-casing.
 */
const ARC_BOX = "absolute inset-0 m-auto size-[300px] sm:size-[380px] lg:size-[460px]";

/**
 * 1.25px on screen at each box size: 1.25 ÷ (box ÷ 200 viewBox units) →
 * 300px box ⇒ 0.833, 380px ⇒ 0.658, 460px ⇒ 0.543.
 */
const ARC_STROKE = "[stroke-width:0.833] sm:[stroke-width:0.658] lg:[stroke-width:0.543]";

/**
 * Positioned layer the arc is centred inside. The card's `overflow-hidden` does
 * the cropping; the layer itself never intercepts a click.
 */
export function ArcLayer({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      {children}
    </span>
  );
}

export function CurriculumArc({
  id,
  quadrant,
}: {
  /** Unique per card — SVG gradient ids are document-global. */
  id: string;
  /** 0–3 for one quadrant; omit for the flagship's closed circle. */
  quadrant?: 0 | 1 | 2 | 3;
}) {
  const isArc = quadrant !== undefined;
  const rotation = isArc ? quadrant * 90 : 0;

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      className={ARC_BOX}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Same treatment as the نبذة circle: the stroke is not a flat line but
            a gradient that fades as it travels, so the curve reads as drawn
            rather than stamped. White against the card colour — no new hue.
            Angled from the top-trailing corner so it runs ALONG a quadrant
            rather than across it; because the arc is rotated by a transform,
            the gradient turns with it and all four fade identically. Peak lands
            at the ~28% the whole layer is set to, tailing to about half that. */}
        <linearGradient id={id} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RADIUS}
        pathLength={360}
        stroke={`url(#${id})`}
        strokeLinecap="round"
        opacity={0.28}
        style={
          isArc
            ? ({
                "--arc-turn": `${rotation}deg`,
                "--arc-turn-hover": `${rotation - EXTEND / 2}deg`,
              } as React.CSSProperties)
            : undefined
        }
        // Written out in full: Tailwind scans source text, so the dash values
        // cannot be interpolated from SWEEP / EXTEND above.
        className={cn(
          ARC_STROKE,
          isArc && [
            "[transform-box:fill-box] [transform-origin:center]",
            "[transform:rotate(var(--arc-turn))] [stroke-dasharray:90_360]",
            "transition-[transform,stroke-dasharray] duration-[320ms] ease-[cubic-bezier(.22,1,.36,1)]",
            "group-hover:[transform:rotate(var(--arc-turn-hover))] group-hover:[stroke-dasharray:102_360]",
            "group-focus-visible:[transform:rotate(var(--arc-turn-hover))] group-focus-visible:[stroke-dasharray:102_360]",
            // Reduced motion: final extended length, no transition. (Hover
            // resolves to the same values, so nothing changes on hover.)
            "motion-reduce:[transform:rotate(var(--arc-turn-hover))] motion-reduce:[stroke-dasharray:102_360]",
            "motion-reduce:transition-none",
          ],
        )}
      />
    </svg>
  );
}
