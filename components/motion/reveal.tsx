"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useReveal } from "./use-reveal";

/**
 * Scroll-triggered entrance (fade + gentle rise, once) via IntersectionObserver
 * + CSS transitions. Same API as before so all section usages are unchanged.
 * Content is visible by default and only hidden once JS confirms it can reveal
 * it again — honors prefers-reduced-motion and degrades to fully visible.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  // delay is render-time + deterministic → no hydration mismatch.
  const style = delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined;

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
