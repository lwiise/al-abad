import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Bg = "background" | "surface" | "lilac" | "ink" | "plum" | "hero";

/**
 * The section rhythm is white ↔ lilac, with ink as the dark anchor.
 *
 * `surface` (#f8f6fb) is for cards and insets and is NOT the alternating band:
 * measured against #ffffff it is 1.07:1, which is below the threshold of
 * perception — alternating the two produces no rhythm at all, just a page that
 * looks flat and slightly dirty. `lilac` (#ebe3f7) is 1.25:1 against white,
 * a step you can actually see. Verify with `pnpm check-contrast`.
 *
 * Section 7 (الذكاء) is the one band that takes `surface`, by owner decision:
 * the tone was its inset panel's, and the panel was dropped in favour of
 * carrying it edge to edge. It sits under section 6's `background`, so that one
 * boundary is deliberately faint and the dot texture and violet fills do the
 * marking. It is an exception, not a licence to alternate the two.
 *
 * `hero` is the other exception, and it is the opposite intent: it holds the tone
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
 *
 * Takes a prop spread so `SectionHeading` can hand it a `data-seq-item` when
 * cascading. It is never marked on its own: the five hand-built headings that
 * use this standalone leave their eyebrow and h2 unmarked, and a lone 12px bar
 * sliding in under static type is worse than no motion at all.
 */
export function HeadingRule({
  light,
  className,
  ...rest
}: { light?: boolean; className?: string } & Omit<
  ComponentProps<"span">,
  "className" | "children" | "aria-hidden"
>) {
  return (
    <span
      {...rest}
      aria-hidden="true"
      className={cn(
        "mt-5 block h-1 w-12 rounded-full",
        light ? "bg-white/30" : "bg-primary/30",
        className,
      )}
    />
  );
}

/**
 * Inside a `<Sequence>` a heading can arrive one of two ways, and they are
 * mutually exclusive:
 *
 * - as ONE item — pass `data-seq-item` through the spread. This is the
 *   default reading and what `faq.tsx` settled on: cascading the heading's own
 *   lines *as well* doubles the motion in a single glance.
 * - as FOUR — pass `seq`, which marks the eyebrow, the h2, the rule and the
 *   sub so they arrive in reading order.
 *
 * `seq` is opt-in rather than always-on precisely because the markers are
 * invisible until something wraps the heading in a `Sequence`. Shipping them
 * unconditionally would mean the next person to add a `Sequence` inherits a
 * four-step cascade they never asked for and never saw in a diff.
 *
 * The `Omit` on the spread is load-bearing: `ComponentProps<"div">` carries
 * `title?: string` (the tooltip attribute), which intersects with this
 * component's required `title: string` to `never`.
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  light = false,
  seq = false,
  className,
  ...rest
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
  light?: boolean;
  /** Cascade the heading's own parts instead of arriving as one item. */
  seq?: boolean;
  className?: string;
} & Omit<ComponentProps<"div">, "title" | "children" | "className">) {
  // undefined → React omits the attribute entirely, so this is inert when off.
  // The selector matches on presence, so the empty string is enough when on.
  const item = seq ? "" : undefined;

  return (
    <div
      {...rest}
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-start",
        className,
      )}
    >
      {/* Lilac, not violet, on dark: violet on ink measures 2.92:1 — below even
          the 3:1 graphics threshold, and this is real text. Lilac is 9.50:1 and
          is what CLAUDE.md's dark-section rule already calls for. */}
      {eyebrow && (
        <p
          data-seq-item={item}
          className={cn("mb-3 text-sm font-medium", light ? "text-lilac" : "text-secondary")}
        >
          {eyebrow}
        </p>
      )}
      <h2
        data-seq-item={item}
        className={cn(
          "text-3xl font-bold md:text-4xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <HeadingRule
        data-seq-item={item}
        light={light}
        className={cn(align === "center" && "mx-auto")}
      />
      {sub && (
        <p
          data-seq-item={item}
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
