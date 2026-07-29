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
 *   أدوات عملية   a set of four implements; each rises into place in turn
 *   خبرة ميدانية  a route already travelled; its waypoints fill in along it
 *
 * The route is a FILLED tapered ribbon, not a stroked path, and what animates
 * is the waypoints — never the ribbon drawing itself. A path that draws is
 * exactly the line animation being removed.
 *
 * Forms stay geometric rather than illustrative. CLAUDE.md's warning about
 * generic template visuals is at its sharpest here: a wrench-and-screwdriver
 * icon set would be precisely the failure it describes.
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
 * Decorative: the section carries a visually-hidden live region describing
 * this, so the SVG itself is aria-hidden.
 */

export const INSTRUCTOR_STATES = ["method", "tools", "field"] as const;

export type InstructorState = (typeof INSTRUCTOR_STATES)[number];
export type SignatureState = InstructorState | "idle";

const BOX = 240;

const rad = (deg: number) => (deg * Math.PI) / 180;
const r2 = (n: number) => +n.toFixed(2);

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
// أدوات عملية — four implements
// ---------------------------------------------------------------------------

/**
 * One family, four working ends. The shared stem is what makes them a SET; the
 * differing ends are what make them four tools. Deliberately not recognisable
 * hardware — for a relationship counsellor the tools are conceptual, and a
 * literal wrench would be absurd.
 *
 * Built from explicit point arrays rather than authored `d` strings, so the
 * clip assertions below can check real coordinates. The one curved end is a
 * `<circle>` for the same reason: an arc command's `rx ry rot flags` are not
 * coordinates, and a checker that pairs path numbers blindly reads them as
 * some — which is exactly the false positive this shape produced first time.
 */
const TOOL_X = [58, 98, 138, 178];
const TOOL_TOP = 84;
const TOOL_BOTTOM = 156;

type Pt = [number, number];

const poly = (pts: Pt[]) =>
  `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ") + " Z";

const TOOLS = TOOL_X.map((x, i) => {
  // Chamfered top, so the stem reads as a handle without an arc.
  const stem: Pt[] = [
    [x - 6.5, TOOL_TOP + 9],
    [x - 3, TOOL_TOP],
    [x + 3, TOOL_TOP],
    [x + 6.5, TOOL_TOP + 9],
    [x + 6.5, TOOL_BOTTOM],
    [x - 6.5, TOOL_BOTTOM],
  ];

  const b = TOOL_BOTTOM;
  const ends: Pt[][] =
    i === 0
      ? [[[x - 15, b], [x + 15, b], [x + 11, b + 22], [x - 15 + 4, b + 22]]] // flat blade
      : i === 1
        ? [
            [[x - 13, b], [x - 3, b], [x - 3, b + 24], [x - 13, b + 24]], // two prongs
            [[x + 3, b], [x + 13, b], [x + 13, b + 24], [x + 3, b + 24]],
          ]
        : i === 2
          ? [[[x - 14, b], [x + 14, b], [x, b + 26]]] // point
          : []; // the disc below

  return {
    polys: [stem, ...ends],
    disc: i === 3 ? { cx: x, cy: b + 13, r: 14 } : null,
  };
});

// ---------------------------------------------------------------------------
// خبرة ميدانية — a travelled route
// ---------------------------------------------------------------------------

const ROUTE: [number, number][] = [
  [46, 194],
  [116, 178],
  [84, 86],
  [196, 54],
];

const bez = (t: number, p: [number, number][]): [number, number] => {
  const u = 1 - t;
  return [0, 1].map(
    (i) =>
      u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i],
  ) as [number, number];
};

const tangent = (t: number, p: [number, number][]): [number, number] => {
  const u = 1 - t;
  return [0, 1].map(
    (i) =>
      3 * u * u * (p[1][i] - p[0][i]) +
      6 * u * t * (p[2][i] - p[1][i]) +
      3 * t * t * (p[3][i] - p[2][i]),
  ) as [number, number];
};

/**
 * The ribbon is BUILT, not typed: sample the centreline, offset each sample
 * along its normal by a tapering half-width, then close the two sides into one
 * filled polygon. Hand-authoring an offset curve is where a tapered ribbon goes
 * subtly wrong, and it is also how a shape silently escapes the viewBox.
 */
const RIBBON = (() => {
  const N = 30;
  const side = (sign: number) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const t = i / N;
      const [x, y] = bez(t, ROUTE);
      const [tx, ty] = tangent(t, ROUTE);
      const len = Math.hypot(tx, ty) || 1;
      const half = 7.5 - 4 * t; // tapers along the way travelled
      return [r2(x + (-ty / len) * half * sign), r2(y + (tx / len) * half * sign)] as [
        number,
        number,
      ];
    });
  const out = side(1);
  const back = side(-1).reverse();
  return (
    `M ${out[0][0]} ${out[0][1]} ` +
    out.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ") +
    ` ` +
    back.map(([x, y]) => `L ${x} ${y}`).join(" ") +
    " Z"
  );
})();

const WAYPOINTS = [0.04, 0.3, 0.54, 0.78, 0.98].map((t) => {
  const [x, y] = bez(t, ROUTE);
  return { cx: r2(x), cy: r2(y) };
});
const WAYPOINT_R = 9;

// ---------------------------------------------------------------------------
// Clip assertions. Kept from the previous art, adapted: browsers clip <svg> at
// the viewBox, and that failure is invisible in a screenshot. Checks the pages
// in their LIFTED rest position too — that is the one thing here that lives
// outside its authored bounds.
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
assertInside(
  "tools",
  TOOLS.flatMap((t) => [
    ...t.polys.flat(),
    ...(t.disc
      ? ([
          [t.disc.cx - t.disc.r, t.disc.cy - t.disc.r],
          [t.disc.cx + t.disc.r, t.disc.cy + t.disc.r],
        ] as Pt[])
      : []),
  ]),
);
assertInside("ribbon", numbersIn(RIBBON));
assertInside(
  "waypoints",
  WAYPOINTS.flatMap(({ cx, cy }) => [
    [cx - WAYPOINT_R, cy - WAYPOINT_R],
    [cx + WAYPOINT_R, cy + WAYPOINT_R],
  ] as [number, number][]),
);

// ---------------------------------------------------------------------------

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

      {/* أدوات عملية */}
      <g className="mi-tools">
        {TOOLS.map((t, i) => (
          <g
            key={i}
            className="mi-tool"
            fill={i === 0 ? "var(--color-coral)" : "var(--color-lilac)"}
            fillOpacity={i === 0 ? 0.95 : 0.7}
          >
            {t.polys.map((pts, j) => (
              <path key={j} d={poly(pts)} />
            ))}
            {t.disc && <circle cx={t.disc.cx} cy={t.disc.cy} r={t.disc.r} />}
          </g>
        ))}
      </g>

      {/* خبرة ميدانية */}
      <g className="mi-route">
        <path className="mi-ribbon" d={RIBBON} fill="var(--color-lilac)" fillOpacity="0.4" />
        {WAYPOINTS.map((w, i) => (
          <circle
            key={i}
            className="mi-wp"
            cx={w.cx}
            cy={w.cy}
            r={WAYPOINT_R}
            // The last waypoint is where the road has reached.
            fill={i === WAYPOINTS.length - 1 ? "var(--color-coral)" : "var(--color-lilac)"}
            fillOpacity={i === WAYPOINTS.length - 1 ? 1 : 0.8}
          />
        ))}
      </g>
    </svg>
  );
}
