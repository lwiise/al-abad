import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Bg = "background" | "surface" | "lilac" | "ink" | "plum";

const bgMap: Record<Bg, string> = {
  background: "bg-background",
  surface: "bg-surface",
  lilac: "bg-surface-strong",
  ink: "bg-ink",
  plum: "bg-primary",
};

type Width = "default" | "wide" | "full";

const widthMap: Record<Width, string> = {
  default: "mx-auto max-w-6xl px-6",
  wide: "mx-auto max-w-7xl px-6",
  // Edge-to-edge. Boxing every section at one width is what makes a site read
  // as a document rather than a brand — full-bleed is reserved for the moments
  // that should feel like they own the screen.
  full: "w-full",
};

/** Full-width band + centered container. Drives section rhythm. */
export function Section({
  id,
  bg = "background",
  width = "default",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  bg?: Bg;
  width?: Width;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(bgMap[bg], "py-24 md:py-32", className)}>
      <div className={cn(widthMap[width], containerClassName)}>{children}</div>
    </section>
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
      {eyebrow && (
        <p className={cn("mb-3 text-sm font-medium", light ? "text-violet" : "text-secondary")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-4xl font-bold md:text-5xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <span
        className={cn(
          "mt-5 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary",
          align === "center" && "mx-auto",
        )}
        aria-hidden="true"
      />
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
