import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Bg = "background" | "surface" | "lilac" | "ink" | "plum" | "hero";

/**
 * The section rhythm is white ↔ lilac, with ink as the dark anchor.
 *
 * `surface` (#f8f6fb) is kept for cards and insets but is NOT the alternating
 * band: measured against #ffffff it is 1.07:1, which is below the threshold of
 * perception — alternating the two produces no rhythm at all, just a page that
 * looks flat and slightly dirty. `lilac` (#ebe3f7) is 1.25:1 against white,
 * a step you can actually see. Verify with `pnpm check-contrast`.
 *
 * `hero` is the one exception, and it is the opposite intent: it holds the tone
 * section 1 ends on instead of stepping away from it, so section 2 reads as the
 * same sheet of paper the hero is printed on. It belongs to section 2 alone —
 * see `.section-hero-surface` in globals.css. Anywhere else it would just be
 * the invisible white/surface alternation the paragraph above rules out.
 */
const bgMap: Record<Bg, string> = {
  background: "bg-background",
  surface: "bg-surface",
  lilac: "bg-surface-strong",
  ink: "bg-ink",
  plum: "bg-primary",
  hero: "section-hero-surface",
};

/** Full-width band + centered max-width container. Drives section rhythm. */
export function Section({
  id,
  bg = "background",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  bg?: Bg;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(bgMap[bg], "py-20 md:py-24", className)}>
      <div className={cn("mx-auto max-w-6xl px-6", containerClassName)}>{children}</div>
    </section>
  );
}

/**
 * The one heading rule — flat, never a gradient.
 *
 * There used to be seven hand-copied `bg-gradient-to-r from-primary to-secondary`
 * bars across the site. An identical two-hue gradient stamped under every
 * heading is the loudest generic-template signal a page can carry, and having
 * it duplicated verbatim meant it could never be changed in one place. It is
 * one component now, and it is flat. Don't reintroduce the gradient.
 *
 * Decorative only (aria-hidden), so it is exempt from WCAG 1.4.11 — see the
 * note in scripts/check-contrast.mjs.
 */
export function HeadingRule({ light, className }: { light?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-5 block h-1 w-12 rounded-full",
        light ? "bg-white/30" : "bg-primary/30",
        className,
      )}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-start",
        className,
      )}
    >
      {/* Lilac, not violet, on dark: violet on ink measures 2.92:1 — below even
          the 3:1 graphics threshold, and this is real text. Lilac is 9.50:1 and
          is what CLAUDE.md's dark-section rule already calls for. */}
      {eyebrow && (
        <p className={cn("mb-3 text-sm font-medium", light ? "text-lilac" : "text-secondary")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl font-bold md:text-4xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <HeadingRule light={light} className={cn(align === "center" && "mx-auto")} />
      {sub && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            light ? "text-neutral-300" : "text-foreground-muted",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
