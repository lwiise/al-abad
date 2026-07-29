import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Bg = "background" | "surface" | "lilac" | "ink" | "night" | "plum" | "hero";

/**
 * The section rhythm is white ↔ lilac, with two dark anchors: section 3 on
 * `ink` and section 7 on `night`.
 *
 * `surface` (#f8f6fb) is for cards and insets and is NOT the alternating band:
 * measured against #ffffff it is 1.07:1, which is below the threshold of
 * perception — alternating the two produces no rhythm at all, just a page that
 * looks flat and slightly dirty. `lilac` (#ebe3f7) is 1.25:1 against white,
 * a step you can actually see. Verify with `pnpm check-contrast`.
 *
 * `night` is neutral-900 (#29262d), the ramp's darkest step, and it belongs to
 * section 7 (الذكاء) — see the note in `ai-teaser.tsx` for why that section is
 * dark at all. Two things make it a separate tone rather than a second use of
 * `ink`:
 *
 *   - Section 7's headline sits over a live dot field. Legibility there is a
 *     question of how much light the FIELD adds, and every millisecond of
 *     headroom the darker plate buys goes into the dots being allowed to be
 *     brighter. On ink the same field would have to be dimmed until it stopped
 *     reading as one.
 *   - Section 3 is ink, four sections earlier. Same value, and the two would
 *     read as the same band returning; a step apart, and section 7 reads as its
 *     own place. It is the same argument `.hero-plate` already makes for
 *     section 1 — and it is deliberately the SAME value as that plate, so the
 *     site has one deep dark rather than three.
 *
 * It is a flat token colour with no gradient of its own: the field is the art,
 * and a bloom under it would both mute the dots and eat the contrast headroom
 * the previous paragraph just bought.
 *
 * `hero` is the other special tone, and it is the opposite intent: it holds the
 * tone section 1 ends on instead of stepping away from it, so section 2 reads
 * as the same sheet of paper the hero is printed on. It belongs to section 2
 * alone — see `.section-hero-surface` in globals.css. Anywhere else it would
 * just be the invisible white/surface alternation the paragraph above rules out.
 */
const bgMap: Record<Bg, string> = {
  background: "bg-background",
  surface: "bg-surface",
  lilac: "bg-surface-strong",
  ink: "bg-ink",
  night: "bg-neutral-900",
  plum: "bg-primary",
  hero: "section-hero-surface",
};

/** Full-width band + centered max-width container. Drives section rhythm. */
export function Section({
  id,
  bg = "background",
  className,
  containerClassName,
  bleed,
  children,
}: {
  id?: string;
  bg?: Bg;
  className?: string;
  containerClassName?: string;
  /**
   * Decorative layer painted edge to edge, outside the centered container.
   *
   * Anything passed as `children` is bounded by `max-w-6xl`, so a texture put
   * there stops at the content column and re-draws the card edge we may be
   * trying to get rid of. This slot renders before the container and the band
   * gets `relative isolate`, so an absolutely positioned child with `-z-10`
   * sits above the band's own background and below the content — full width,
   * no stacking surprises. Pass `aria-hidden` markup only.
   */
  bleed?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(bgMap[bg], "py-20 md:py-24", bleed && "relative isolate", className)}
    >
      {bleed}
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
