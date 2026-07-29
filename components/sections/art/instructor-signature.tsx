import { cn } from "@/lib/utils";

/**
 * The art of قسم التعريف — one drawn form per مرتكز.
 *
 * A DELIBERATE DEPARTURE FROM HOUSE STYLE, and worth naming as one. Every other
 * drawing on this site is built from hairline stroke on a 400 × 340 canvas —
 * the challenges diagram in section 2, the step diagrams in section 5, the
 * outcome diagrams in section 6 — 1.25px non-scaling, plum for structure and
 * coral for the moment that matters. They do use fills, but as accents *within*
 * a stroked figure; the stroke is always what describes the thing. Nowhere else
 * does a silhouette carry the meaning on its own.
 *
 * Here it does, and here there is no stroke at all. That is not drift: the
 * owner's instruction for this section was "instead of lines, draw and animate
 * something that reflects the content — no line animation", after two passes of
 * abstract stroked geometry were rejected. Section 3 is the exception on
 * purpose. If the register is ever reconciled, it is reconciled deliberately,
 * not by someone assuming this file drifted.
 *
 * So each مرتكز gets an artifact of the practice, and the motion is the artifact
 * being used rather than a line being drawn:
 *
 *   منهج علميّ    an open book; its pages settle onto the stack one by one
 *   أدوات عملية   four implements standing in their rack; each is drawn up out
 *                 of it in turn
 *   خبرة ميدانية  ground in section; its layers are laid down from the deepest
 *                 up to the surface
 *
 * WHY THE SECOND AND THIRD FORMS LOOK NOTHING LIKE THEIR FIRST VERSIONS. Both
 * were redrawn after the owner reported they did not read as their مرتكز, and
 * both failures are worth keeping written down because each is easy to walk
 * back into:
 *
 *   أدوات عملية was four bare implements floating in a row: an identical
 *   vertical stem each, with a differing working end at the BOTTOM. At the size
 *   this art actually renders (128–160px) a vertical bar with a point, a flat
 *   edge or a fork under it is not an implement, it is an arrowhead — the set
 *   read as four down-arrows, which says nothing about tools. What fixed it was
 *   the RACK, and the rack is load-bearing: context is what makes a silhouette
 *   an object, and an abstract shape without any defaults to whatever glyph it
 *   most resembles. It also earns the motion — the implements come up out of
 *   something now instead of drifting into place from nowhere. See the note at
 *   TOOLS for what the heads may and may not be; that constraint has already
 *   been broken twice in two different directions.
 *
 *   خبرة ميدانية was a travelled route — a filled bezier ribbon with waypoints
 *   filling in along it. It reads as a journey, and a journey is the visitor's
 *   story, not his credential; worse, section 5 (الخطوات) is already built out
 *   of path-and-station diagrams, so this said the same thing one section
 *   earlier in a different accent. Ground makes the claim the مرتكز actually
 *   makes: depth accumulated in the field, oldest underneath, the surface —
 *   where he is now — on top. Do not put a path back here.
 *
 * Forms stay geometric rather than illustrative. CLAUDE.md's warning about
 * generic template visuals is at its sharpest here: a wrench-and-screwdriver
 * icon set would be precisely the failure it describes, which is why the four
 * heads are deliberately not hardware — for a relationship counsellor the tools
 * are conceptual.
 *
 * Colour, per the dark-section rule: lilac carries the forms (9.50:1 on ink)
 * and coral marks exactly one element in each (3.08:1 — an accent, never the
 * thing you must read). No gradient across a silhouette: a two-hue gradient is
 * the tic CLAUDE.md bans.
 *
 * Every state is driven by `data-state` alone; the motion lives in
 * `app/globals.css` under `.mi-*`. Everything is always mounted at opacity 0,
 * so a state change interpolates from what is on screen instead of appearing.
 *
 * Decorative: the SVG is aria-hidden, and the section carries a visually-hidden
 * description of whichever state is showing. That description is only LIVE while
 * a pointer or the keyboard is driving — the scroll presents all three in turn
 * on the way past, and announcing art nobody asked for is noise. The honest
 * statement of the trade: the selected state is narrated, the scroll-driven
 * presentation is decoration.
 */

export const INSTRUCTOR_STATES = ["method", "tools", "field"] as const;

export type InstructorState = (typeof INSTRUCTOR_STATES)[number];
export type SignatureState = InstructorState | "idle";

const BOX = 240;

const rad = (deg: number) => (deg * Math.PI) / 180;
const r2 = (n: number) => +n.toFixed(2);

type Pt = [number, number];

const poly = (pts: Pt[]) =>
  `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ") + " Z";

/** Axis-aligned box with a corner radius — the handles and the rack. Kept as
 *  data rather than authored `d` strings so the clip assertions below check the
 *  real corners rather than approximating them. */
type Box = { x: number; y: number; w: number; h: number; r: number };

const corners = ({ x, y, w, h }: Box): Pt[] => [
  [x, y],
  [x + w, y + h],
];

// ---------------------------------------------------------------------------
// منهج علميّ — an open book
// ---------------------------------------------------------------------------

/** Where the pages hinge. Also the CSS transform-origin for `.mi-page`. */
const SPINE: [number, number] = [120, 104];

/**
 * A 3/4 open book: the two boards fan up and away from a spine that sits lower
 * than both outer edges, which is what makes it read as opened rather than as
 * two parallelograms. The near edge of each board is drawn as a separate
 * thickness so the object has depth without any outline.
 */
const BOOK_LEFT = "M 120 104 L 36 82 L 36 136 L 120 158 Z";
const BOOK_RIGHT = "M 120 104 L 204 82 L 204 136 L 120 158 Z";
/** Board thickness — the edge you would see, so the boards are solids not sheets. */
const BOOK_LEFT_EDGE = "M 36 136 L 120 158 L 120 168 L 36 146 Z";
const BOOK_RIGHT_EDGE = "M 204 136 L 120 158 L 120 168 L 204 146 Z";
/** The spine block, so the two halves read as one object rather than two slabs. */
const BOOK_SPINE = "M 115 103 L 125 103 L 125 170 L 115 170 Z";

/**
 * Three leaves hinged at the spine. They rest lifted and rotate down onto the
 * stack in turn — the rotation is in globals.css; the shapes are identical so
 * the sequence reads as one page after another, not three different things.
 */
const PAGE = "M 120 104 L 200 83 L 200 92 L 120 112 Z";
const PAGE_LIFT = [-38, -26, -14]; // degrees at rest, settling to 0

// ---------------------------------------------------------------------------
// أدوات عملية — four implements in their rack
// ---------------------------------------------------------------------------

/** How far below its resting place an implement starts, matching
 *  `.mi-tool { translate: 0 34px }` in globals.css. Named here only so the clip
 *  assertion can check the low position too; change one, change both. */
const TOOL_RISE = 34;

/** Every handle ends here — inside the rack body, so no implement ever shows a
 *  cut end. The rack is painted after the implements for the same reason. */
const HANDLE_FOOT = 182;

/**
 * One head and one handle each. Ordered right → left, so index 0 is the first
 * one an Arabic reader meets and the stagger runs with the text rather than
 * against it. Every handle is the same width and seated at the same depth —
 * that is what makes the four a SET — and the four heads differ in silhouette,
 * mass and height, which is what stops them reading as one repeated glyph.
 *
 * WHAT THE HEADS MAY NOT BE, both learned the hard way at the ~140px this
 * actually renders at:
 *
 *   Nothing rounded on a thin stem. A round paddle is a spoon and prongs are a
 *   fork, and once two of the four read as cutlery the whole rack becomes a
 *   drying rack — which is what the version before this one did. Heads here are
 *   angular and asymmetric — a wedge, a hook, a notched block, a skewed plate —
 *   and the handles are wide enough (14) to be gripped rather than sipped from.
 *
 *   Nothing pointed hanging BELOW the handle. The first version had the working
 *   ends at the bottom and read as four down-arrows: a vertical bar with a
 *   point under it is an arrowhead before it is anything else. Heads go on top.
 *
 * Both failures are the same failure — an abstract shape with no context
 * defaults to whichever glyph it most resembles — which is what the rack is
 * for. Keep it.
 */
type Tool = { head: Pt[]; handle: Box };

const TOOLS: Tool[] = [
  // wedge — the coral one
  {
    head: [
      [172, 60],
      [204, 60],
      [195, 96],
      [181, 96],
    ],
    handle: { x: 181, y: 92, w: 14, h: HANDLE_FOOT - 92, r: 4 },
  },
  // hook
  {
    head: [
      [135, 68],
      [149, 68],
      [149, 108],
      [119, 108],
      [119, 94],
      [135, 94],
    ],
    handle: { x: 135, y: 104, w: 14, h: HANDLE_FOOT - 104, r: 4 },
  },
  // notched block
  {
    head: [
      [80, 76],
      [92, 76],
      [92, 88],
      [100, 88],
      [100, 76],
      [112, 76],
      [112, 108],
      [80, 108],
    ],
    handle: { x: 89, y: 104, w: 14, h: HANDLE_FOOT - 104, r: 4 },
  },
  // skewed plate
  {
    head: [
      [38, 72],
      [66, 72],
      [58, 104],
      [30, 104],
    ],
    handle: { x: 43, y: 100, w: 14, h: HANDLE_FOOT - 100, r: 4 },
  },
];

/** The rack. Body first, rim over it — the rim is the line the implements pass
 *  through, and it has to read as in front of them. */
const RACK_BODY: Box = { x: 36, y: 156, w: 168, h: 28, r: 10 };
const RACK_RIM: Box = { x: 28, y: 146, w: 184, h: 14, r: 7 };

// ---------------------------------------------------------------------------
// خبرة ميدانية — ground, in section
// ---------------------------------------------------------------------------

/**
 * ONE MASS, CUT — not a stack of bars. Two passes at this were built out of
 * separate horizontal bands and both failed at the size this renders, in
 * opposite directions, so the shape is worth defending:
 *
 *   Bands that NARROWED going up made a symmetrical pyramid, which says summit
 *   — a hierarchy climbed — and not depth accumulated.
 *
 *   Bands of roughly equal width with ragged ends made a loading skeleton: six
 *   detached rounded bars stacked with gaps is what every placeholder on the
 *   web looks like.
 *
 * What fixes both is that ground is CONTINUOUS. The layers here touch — each
 * one runs from its own seam down to the next — and the block has clean
 * vertical sides and a flat floor, so it reads as a section cut out of the
 * ground rather than as objects arranged in a pile. The one edge that is not
 * ruled is the top: the surface undulates, and that contour is most of what
 * says "ground" at 128px.
 *
 * Seams undulate too. Parallel straight seams are stripes, and stripes are a
 * flag or a palette; a gentle wave with its own period and phase per seam is
 * geology. `y` is the seam's mean depth, `amp` its swing — SEAM SPACING MUST
 * EXCEED THE SUM OF THE TWO AMPLITUDES or the seams cross and the layers turn
 * inside out, which the assertion below checks rather than trusting.
 */
type Seam = { y: number; amp: number; freq: number; phase: number };

const GROUND_X0 = 28;
const GROUND_X1 = 212;
const GROUND_STEPS = 28;

const SEAMS: Seam[] = [
  { y: 72, amp: 6, freq: 0.03, phase: 10 }, // the surface
  // Shares the surface's period and phase, at a smaller amplitude, so the top
  // layer keeps an even thickness instead of swelling and pinching. It is the
  // coral one, and coral is an accent — a band that wanders between 11 and 19
  // units thick is the loudest thing in the frame at the wide end.
  { y: 83, amp: 4.5, freq: 0.03, phase: 10 },
  { y: 106, amp: 6, freq: 0.034, phase: 130 },
  { y: 128, amp: 5, freq: 0.028, phase: 40 },
  { y: 149, amp: 4, freq: 0.032, phase: 100 },
  { y: 168, amp: 4, freq: 0.022, phase: 160 },
  { y: 184, amp: 0, freq: 0, phase: 0 }, // the floor of the cut
];

/** Opacity by layer, surface first. Depth recedes; the surface is the present,
 *  which is why it is also the one coral element in this state. */
const LAYER_OPACITY = [1, 0.78, 0.62, 0.5, 0.4, 0.32];

const seamY = (s: Seam, x: number) => r2(s.y + s.amp * Math.sin(s.freq * (x - s.phase)));

const GROUND_XS = Array.from({ length: GROUND_STEPS + 1 }, (_, i) =>
  r2(GROUND_X0 + ((GROUND_X1 - GROUND_X0) * i) / GROUND_STEPS),
);

/** Closed band between two seams: down the upper one, back along the lower. The
 *  first and last samples sit exactly on GROUND_X0/X1, so the sides of every
 *  layer are vertical and line up into one cut face — no clip path, and so no
 *  generated id to collide with a second instance of this art on a page. */
const stratum = (a: Seam, b: Seam): Pt[] => [
  ...GROUND_XS.map((x) => [x, seamY(a, x)] as Pt),
  ...GROUND_XS.map((x) => [x, seamY(b, x)] as Pt).reverse(),
];

/** Deepest first, so the stagger lays the ground down from underneath and ends
 *  at the surface. */
const STRATA = SEAMS.slice(0, -1)
  .map((s, i) => ({ pts: stratum(s, SEAMS[i + 1]), o: LAYER_OPACITY[i] }))
  .reverse();

// ---------------------------------------------------------------------------
// Clip assertions. Kept from the previous art, adapted: browsers clip <svg> at
// the viewBox, and that failure is invisible in a screenshot. Checks the two
// things that live outside their authored bounds — the pages in their LIFTED
// rest position, and the implements in their LOW one.
// ---------------------------------------------------------------------------

const assertInside = (label: string, pts: [number, number][]) => {
  for (const [x, y] of pts) {
    if (x < 0 || x > BOX || y < 0 || y > BOX) {
      throw new Error(`Instructor art escapes the viewBox: ${label} at ${x},${y}`);
    }
  }
};

/** Only valid for absolute M/L polygons — every `d` it is given is one. */
const numbersIn = (d: string): [number, number][] => {
  const n = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const pairs: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) pairs.push([n[i], n[i + 1]]);
  return pairs;
};

assertInside("book", [
  ...numbersIn(BOOK_LEFT),
  ...numbersIn(BOOK_RIGHT),
  ...numbersIn(BOOK_LEFT_EDGE),
  ...numbersIn(BOOK_RIGHT_EDGE),
  ...numbersIn(BOOK_SPINE),
]);
for (const deg of PAGE_LIFT) {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  assertInside(
    `page@${deg}deg`,
    numbersIn(PAGE).map(([x, y]) => {
      const dx = x - SPINE[0];
      const dy = y - SPINE[1];
      return [SPINE[0] + dx * c - dy * s, SPINE[1] + dx * s + dy * c];
    }),
  );
}
const toolPoints = TOOLS.flatMap((t) => [...t.head, ...corners(t.handle)]);
assertInside("tools", toolPoints);
assertInside(
  `tools@+${TOOL_RISE}px`,
  toolPoints.map(([x, y]) => [x, y + TOOL_RISE] as Pt),
);
assertInside("rack", [...corners(RACK_BODY), ...corners(RACK_RIM)]);
assertInside(
  "strata",
  STRATA.flatMap((l) => l.pts),
);
// Seams that cross turn a layer inside out — a silent failure, since the shape
// still fills and still sits inside the viewBox. Checked at the sample points,
// which is where the geometry is actually evaluated.
SEAMS.slice(0, -1).forEach((a, i) => {
  const b = SEAMS[i + 1];
  for (const x of GROUND_XS) {
    if (seamY(a, x) >= seamY(b, x)) {
      throw new Error(`Instructor art: ground seams ${i} and ${i + 1} cross at x=${x}`);
    }
  }
});

// ---------------------------------------------------------------------------

/** `rx` only — an `<rect>` mirrors it to `ry`, and every corner here is round.
 *  Colour is inherited from the enclosing group. */
const Slab = ({ x, y, w, h, r, o }: Box & { o?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fillOpacity={o} />
);

export function InstructorSignature({
  state,
  className,
}: {
  state: SignatureState;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      data-state={state}
      className={cn("mi-art", className)}
      aria-hidden="true"
    >
      {/* منهج علميّ */}
      <g className="mi-book">
        <path d={BOOK_LEFT} fill="var(--color-lilac)" fillOpacity="0.38" />
        <path d={BOOK_RIGHT} fill="var(--color-lilac)" fillOpacity="0.5" />
        <path d={BOOK_LEFT_EDGE} fill="var(--color-lilac)" fillOpacity="0.7" />
        <path d={BOOK_RIGHT_EDGE} fill="var(--color-lilac)" fillOpacity="0.8" />
        <path d={BOOK_SPINE} fill="var(--color-lilac)" fillOpacity="0.9" />
        {PAGE_LIFT.map((deg, i) => (
          <path
            key={i}
            className="mi-page"
            d={PAGE}
            // The one coral element: the page currently being turned.
            fill={i === 0 ? "var(--color-coral)" : "var(--color-lilac)"}
            fillOpacity={i === 0 ? 0.95 : 0.72}
            style={{ "--mi-lift": `${deg}deg` } as React.CSSProperties}
          />
        ))}
      </g>

      {/* أدوات عملية — the four implements are children 1–4 of this group and
          the rack is child 5, which is what the `.mi-tool:nth-child` stagger in
          globals.css counts. The rack is last so it paints over the handles and
          the implements rise out from behind it. */}
      <g className="mi-tools">
        {TOOLS.map((t, i) => (
          <g
            key={i}
            className="mi-tool"
            fill={i === 0 ? "var(--color-coral)" : "var(--color-lilac)"}
            fillOpacity={i === 0 ? 0.95 : 0.7}
          >
            <path d={poly(t.head)} />
            <Slab {...t.handle} />
          </g>
        ))}
        <g fill="var(--color-lilac)">
          <Slab {...RACK_BODY} o={0.42} />
          <Slab {...RACK_RIM} o={0.62} />
        </g>
      </g>

      {/* خبرة ميدانية */}
      <g className="mi-field">
        {STRATA.map((l, i) => (
          <path
            key={i}
            className="mi-stratum"
            d={poly(l.pts)}
            // The surface is drawn last and is the one coral element.
            fill={i === STRATA.length - 1 ? "var(--color-coral)" : "var(--color-lilac)"}
            fillOpacity={l.o}
          />
        ))}
      </g>
    </svg>
  );
}
