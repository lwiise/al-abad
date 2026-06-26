"use client";

import type { ElementType, ReactNode } from "react";
import { useTilt } from "./use-tilt";

/**
 * A card with the 3D pointer-tilt + lift effect (desktop + motion only).
 * Renders the element given by `as` (div by default) to keep list semantics.
 */
export function TiltCard({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useTilt<HTMLElement>(7);
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
