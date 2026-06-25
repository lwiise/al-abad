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
          "text-3xl font-bold md:text-4xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
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
