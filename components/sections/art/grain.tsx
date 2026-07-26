/**
 * Fine film grain overlay.
 *
 * The single cheapest fix for the flat, plasticky look that large flat-CSS
 * gradients have — a faint noise layer gives them surface and makes the brand
 * colours read as material rather than as swatches. Costs one filtered rect.
 *
 * Decorative and inert: no JS, no animation, so it needs no reduced-motion
 * handling and renders identically everywhere.
 *
 * The filter id is a constant on purpose. Multiple instances on a page emit
 * duplicate ids, and the browser resolves every reference to the first — which
 * is correct here precisely because every definition is identical.
 */
export function Grain({
  className,
  opacity = 0.055,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-0 size-full"}
      preserveAspectRatio="none"
    >
      <filter id="art-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#art-grain)" opacity={opacity} />
    </svg>
  );
}
