import { cn } from "@/lib/utils";

/**
 * Hero backdrop: two shafts of light entering a Najdi plaster wall and
 * overlapping — brighter where they meet than either is alone.
 *
 * Two sources becoming one brighter zone is the same statement the site makes
 * in words, so the plate argues the thesis rather than decorating it.
 *
 * Najdi specifically, not "generic Arabic". The triangular pierced relief is
 * the Diriyah / old-Riyadh motif; mashrabiya and Moroccan zellige are what gets
 * reached for by default and a Saudi audience reads the difference immediately.
 *
 * Drawn entirely in SVG + CSS: no image request, no LCP cost, resolution
 * independent, and the palette is brand tokens rather than whatever a photo
 * happened to contain. Deliberately STATIC — no animation anywhere.
 *
 * ZONE MAP (this is load-bearing, not aesthetic). The hero is RTL with the
 * headline in the right column and the portrait in the left:
 *
 *   left third   — behind the portrait. The DARKEST zone in the frame; the
 *                  cutout is a white thobe and white ghutra, and it dissolves
 *                  against anything lighter.
 *   centre       — where the two shafts cross. The brightest zone.
 *   right third  — behind the headline. Flat, even, no detail, no beam.
 *
 * Verify with a luminance measurement per third after any edit, not by eye.
 */
export function NajdiBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <svg
        className="size-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* Plaster wall: warm, unevenly lit, darkest at the left where the
              portrait stands. */}
          <linearGradient id="nb-wall" x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor="#100c17" />
            <stop offset="0.32" stopColor="#171122" />
            <stop offset="0.62" stopColor="#241a33" />
            <stop offset="1" stopColor="#1a1526" />
          </linearGradient>

          {/* One shaft. Warm at the mouth, gone by the floor. */}
          <linearGradient id="nb-beam" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#f6d9a8" stopOpacity="0.5" />
            <stop offset="0.45" stopColor="#e9b892" stopOpacity="0.26" />
            <stop offset="1" stopColor="#e04f64" stopOpacity="0" />
          </linearGradient>

          {/* Hand-finished plaster — irregular, not a flat fill. */}
          <filter id="nb-plaster" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" />
            <feColorMatrix type="saturate" values="0" />
          </filter>

          {/* Softens the beam edges so they read as light, not as polygons. */}
          <filter id="nb-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>

          {/* Keeps every beam out of the right third — the headline sits there
              and no amount of scrim rescues type over a light shaft. */}
          <linearGradient id="nb-keepout" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" />
            <stop offset="0.55" stopColor="white" />
            <stop offset="0.72" stopColor="black" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id="nb-right-clean">
            <rect width="1200" height="600" fill="url(#nb-keepout)" />
          </mask>

          {/* Re-seats the portrait's ground. A gradient, NOT a rect: with
              preserveAspectRatio="slice" the viewBox is scaled, so any
              straight-edged overlay lands as a visible vertical seam. */}
          <linearGradient id="nb-seat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d0a13" stopOpacity="0.72" />
            <stop offset="0.28" stopColor="#0d0a13" stopOpacity="0.5" />
            <stop offset="0.52" stopColor="#0d0a13" stopOpacity="0.12" />
            <stop offset="0.7" stopColor="#0d0a13" stopOpacity="0" />
          </linearGradient>

          {/* Floor pool falls off vertically instead of ending on an edge. */}
          <radialGradient id="nb-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f2cf9e" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="#f2cf9e" stopOpacity="0.06" />
            <stop offset="1" stopColor="#f2cf9e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1200" height="600" fill="url(#nb-wall)" />

        {/* --- Najdi relief -------------------------------------------------
            A row of pierced triangles, upper area only. Each is drawn twice:
            a dark opening and a lit lower bevel, which is what makes it read
            as relief in a wall rather than as flat shapes on it. */}
        <g mask="url(#nb-right-clean)">
          {/* Small and low-contrast on purpose: this is relief catching a
              little light, not a row of graphic triangles. Two staggered rows
              read as a pierced band rather than a border. */}
          {Array.from({ length: 34 }, (_, i) => {
            const row = i % 2;
            const x = 40 + Math.floor(i / 2) * 52 + row * 26;
            const y = 74 + row * 30;
            const lit = Math.max(0, 1 - x / 780); // brighter nearer the shafts
            return (
              <g key={i}>
                <path d={`M${x} ${y} l13 21 h-26 z`} fill="#0b0810" fillOpacity="0.7" />
                <path
                  d={`M${x} ${y} l13 21 h-26 z`}
                  stroke="#f0d6ae"
                  strokeOpacity={0.05 + lit * 0.13}
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
        </g>

        {/* --- The two shafts -----------------------------------------------
            `screen` is doing the real work: where the two overlap the values
            add, so the crossing is genuinely brighter than either beam. That
            is the whole idea, and it is why this is not one wide gradient. */}
        <g mask="url(#nb-right-clean)" style={{ mixBlendMode: "screen" }}>
          <g filter="url(#nb-soft)">
            <path d="M232 -40 L360 -40 L636 640 L470 640 Z" fill="url(#nb-beam)" />
            <path d="M398 -40 L520 -40 L742 640 L580 640 Z" fill="url(#nb-beam)" />
          </g>
        </g>

        {/* Pool on the floor where the shafts land and cross. */}
        <ellipse cx="560" cy="566" rx="250" ry="60" fill="url(#nb-pool)" mask="url(#nb-right-clean)" />

        {/* Plaster texture over everything — kills gradient banding and gives
            the flat fills a surface. */}
        <rect
          width="1200"
          height="600"
          filter="url(#nb-plaster)"
          opacity="0.05"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Re-seat the portrait's ground last, so the left third is still the
            darkest thing in the frame after the beams and texture land. */}
        <rect width="1200" height="600" fill="url(#nb-seat)" />
      </svg>
    </div>
  );
}
