import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

/** On light grounds — background, surface, lilac. */
const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-secondary text-on-secondary hover:bg-secondary-hover",
  outline: "border border-border-strong text-foreground hover:bg-surface",
  ghost: "text-foreground hover:bg-surface",
  danger: "bg-accent text-on-accent hover:bg-accent-hover",
};

/**
 * On ink, selected with `light` — the same convention `SectionHeading` uses,
 * where `light` means "this sits on a dark ground".
 *
 * Not a cosmetic mirror of the set above: plum is 1.26:1 on ink and teal is
 * 2.78:1, so `primary` and `secondary` cannot simply be reused. Per CLAUDE.md's
 * dark-section rule the dark-ground primary is lilac (9.50:1) and the
 * supporting fills are translucent white. Coral survives unchanged — it is the
 * one brand colour that reads on both grounds.
 *
 * This exists because `final-cta`, `meet-instructor` and `vision` were each
 * hand-rolling their own dark CTA, and the three had drifted apart.
 */
const variantsOnDark: Record<Variant, string> = {
  primary: "bg-lilac text-ink hover:bg-white",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  outline: "border border-white/24 text-white hover:bg-white/10",
  ghost: "text-white hover:bg-white/10",
  danger: "bg-accent text-on-accent hover:bg-accent-hover",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
};

/** Shared classes so links can look like buttons too. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", light = false) {
  return cn(base, (light ? variantsOnDark : variants)[variant], sizes[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  light = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Set on dark (ink) grounds — see the note on `variantsOnDark`. */
  light?: boolean;
}) {
  return <button className={cn(buttonClasses(variant, size, light), className)} {...props} />;
}
