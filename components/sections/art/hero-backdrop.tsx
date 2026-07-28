import { cn } from "@/lib/utils";

/**
 * Hero background — five static layers, bottom to top:
 *
 *   1 BASE   white → surface wash
 *   2 LIGHT  two soft radial pools, plum upper-right, accent lower-left
 *   3 NAJDI  stepped triangular relief, lower-left only, masked, at 5%
 *   4 SCRIM  legibility ramp under the RTL headline zone
 *   5 GRAIN  feTurbulence overlay; without it the wide gradients band
 *
 * There was a sixth layer — two multiplying ripple fields — removed at the
 * owner's request. Nothing here animates now; the background is entirely
 * static.
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

      {/* 2 · LIGHT — two pools, wide falloff, static */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 52% at 84% 14%, color-mix(in oklab, var(--color-primary) 14%, transparent) 0%, transparent 72%)," +
            "radial-gradient(52% 48% at 12% 88%, color-mix(in oklab, var(--color-coral) 11%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* 3 · NAJDI — texture, felt not seen */}
      <div className="hero-najdi absolute inset-0" />

      {/* 4 · SCRIM — horizontal on desktop (headline sits right in RTL),
             vertical under 1080px where the layout stacks. */}
      <div
        className="absolute inset-0 max-lg:hidden"
        style={{
          background:
            "linear-gradient(to left, color-mix(in oklab, var(--color-background) 82%, transparent) 0%, color-mix(in oklab, var(--color-background) 42%, transparent) 26%, transparent 54%)",
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-background) 80%, transparent) 0%, color-mix(in oklab, var(--color-background) 40%, transparent) 30%, transparent 60%)",
        }}
      />
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
