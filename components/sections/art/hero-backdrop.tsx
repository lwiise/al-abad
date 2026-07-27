import { cn } from "@/lib/utils";

/**
 * Emitter alphas are 0.20 / 0.17, not the briefed 0.52 / 0.46.
 *
 * Those figures put a 1.25px multiply stroke against near-white paper, and the
 * field read as the loudest thing in the section — six 780px arcs sweeping the
 * whole viewport. The brief's own acceptance test is "noticeable only on
 * second look", and that test wins over the number. The ratio between the two
 * emitters is preserved so purple still leads the accent.
 */
const A = { cx: 455, cy: 742, stroke: "var(--color-aubergine)", opacity: 0.2 };
const B = { cx: 1010, cy: 688, stroke: "var(--color-coral)", opacity: 0.17 };

const CYCLE = 19; // seconds. Slow enough that it never reads as "an animation".
const WAVES = 6;

/**
 * Six concentric waves per emitter, staggered with NEGATIVE delays so the
 * field is already mid-flow at first paint — nothing appears to start.
 *
 * Under reduced motion the animation is disabled in CSS and these frozen radii
 * are what remain: six fixed rings spread across the same range, so the layer
 * still reads as two wave fields rather than vanishing.
 */
function waves({ cx, cy, stroke, opacity }: typeof A, phase: number) {
  return Array.from({ length: WAVES }, (_, i) => {
    const delay = -((i / WAVES) * CYCLE + phase);
    const frozen = 30 + ((i + 0.5) / WAVES) * 750;
    return (
      <circle
        key={i}
        className="hero-ripple"
        cx={cx}
        cy={cy}
        r={frozen}
        fill="none"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.25}
        vectorEffect="non-scaling-stroke"
        style={{ animationDelay: `${delay}s` }}
      />
    );
  });
}

/**
 * Hero background — six layers, bottom to top. Every one is load-bearing:
 *
 *   1 BASE    warm paper → sand wash
 *   2 LIGHT   two soft radial pools, purple upper-right, accent lower-left
 *   3 NAJDI   stepped triangular relief, lower-left only, masked out by 5%
 *   4 RIPPLES two wave fields that multiply — the signature
 *   5 SCRIM   legibility ramp under the RTL headline zone
 *   6 GRAIN   feTurbulence overlay; without it the wide gradients band
 *
 * The ripple layer multiplies, so where the two fields cross they darken each
 * other. That interference is the point — two people, and what happens where
 * they meet — and it is why there is no third element faking the overlap.
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
          background: "linear-gradient(170deg, var(--color-paper) 0%, var(--color-sand) 100%)",
        }}
      />

      {/* 2 · LIGHT — two pools, wide falloff, static */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 52% at 84% 14%, color-mix(in oklab, var(--color-aubergine) 14%, transparent) 0%, transparent 72%)," +
            "radial-gradient(52% 48% at 12% 88%, color-mix(in oklab, var(--color-coral) 11%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* 3 · NAJDI — texture, felt not seen */}
      <div className="hero-najdi absolute inset-0" />

      {/* 4 · RIPPLES */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ mixBlendMode: "multiply" }}
      >
        {waves(A, 0)}
        {waves(B, CYCLE / 2.4)}
      </svg>

      {/* 5 · SCRIM — horizontal on desktop (headline sits right in RTL),
             vertical under 1080px where the layout stacks. */}
      <div
        className="absolute inset-0 max-lg:hidden"
        style={{
          background:
            "linear-gradient(to left, color-mix(in oklab, var(--color-paper) 82%, transparent) 0%, color-mix(in oklab, var(--color-paper) 42%, transparent) 26%, transparent 54%)",
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-paper) 80%, transparent) 0%, color-mix(in oklab, var(--color-paper) 40%, transparent) 30%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, var(--color-sand) 0%, transparent 100%)",
        }}
      />

      {/* 6 · GRAIN */}
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
