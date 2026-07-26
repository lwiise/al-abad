"use client";

import type { ElementType, ReactNode, RefObject } from "react";
import { useParallax } from "./use-parallax";

/**
 * Declarative wrapper over `useParallax` — a layer that drifts against the
 * scroll. Compose several at different depths inside one section to build the
 * sense of distance that a single flat fade-up can never give.
 *
 * Renders the element given by `as` so list/semantic markup is preserved.
 */
export function ParallaxLayer({
  as,
  depth = 0.25,
  trigger,
  minWidth,
  className,
  children,
}: {
  as?: ElementType;
  depth?: number;
  trigger?: RefObject<HTMLElement | null>;
  minWidth?: number;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useParallax<HTMLElement>(depth, { trigger, minWidth });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
