import { cn } from "@/lib/utils";

/**
 * Hero background — the GROUND the plate floats on. Four static layers,
 * bottom to top:
 *
 *   1 BASE   white → surface wash
 *   2 LIGHT  two soft radial pools, plum upper-right, violet lower-left
 *   3 NAJDI  stepped triangular relief, lower-left only, masked, at 5%
 *   4 FADE   opaque ramp to --color-surface over the last 10rem
 *   5 GRAIN  feTurbulence overlay; without it the wide gradients band
 *
 * There were two SCRIM layers between 3 and 4 — legibility ramps under the
 * headline zone, one horizontal for desktop and one vertical for the stacked
 * layout. The headline now sits on the plate, which brings its own ground, so
 * they were only muddying the margin the plate floats in. Removed.
 *
 * Layer 4 is load-bearing and must stay: it makes the section's final row
 * exactly #f8f6fb, which is the tone `.section-hero-surface` holds through
 * section 2. Change the colour it lands on and a visible band appears at the
 * join.
 *
 * There was also once a sixth layer — two multiplying ripple fields — removed
 * at the owner's request. Nothing here animates; the background is static.
 *
 * All CSS/SVG. No image request, no library, nothing to load.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* 1 · BASE */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, var(--color-background) 0%, var(--color-surface) 100%)",
        }}
      />

      {/* 2 · LIGHT — two pools, wide falloff, static.
             Violet rather than coral at the lower pool: it is the halo the
             plate's END corner sits in, and violet is what the plate's own
             glow is made of. Decorative light, never text — on this ground it
             is a lilac haze, which is the point. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 52% at 88% 12%, color-mix(in oklab, var(--color-primary) 14%, transparent) 0%, transparent 72%)," +
            "radial-gradient(50% 46% at 8% 84%, color-mix(in oklab, var(--color-violet) 20%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* 3 · NAJDI — texture, felt not seen */}
      <div className="hero-najdi absolute inset-0" />

      {/* 4 · FADE — the seam contract. Do not change what this lands on. */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, var(--color-surface) 0%, transparent 100%)",
        }}
      />

      {/* 5 · GRAIN */}
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
