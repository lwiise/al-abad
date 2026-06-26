"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useReveal } from "./use-reveal";

/**
 * Reveals its direct children in a staggered cascade on scroll-in, via
 * IntersectionObserver + CSS transitions. Renders the element given by `as`
 * (div by default) so list semantics (ul/ol) are kept.
 * `preset`: "rise" (fade+up, default) or "flip" (3D rotateX flip-in).
 * Per-child delay is set on the real DOM children (robust to Fragment/string
 * children; no style forwarding needed). Honors prefers-reduced-motion.
 */
export function Stagger({
  as,
  className,
  children,
  amount = 0.1,
  preset = "rise",
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  amount?: number;
  preset?: "rise" | "flip";
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, {
    attr: "data-stagger",
    prepare: (el) => {
      const kids = el.children;
      for (let i = 0; i < kids.length; i++) {
        (kids[i] as HTMLElement).style.setProperty("--reveal-delay", `${i * amount}s`);
      }
    },
  });

  // preset is render-time + deterministic; the hidden rule also requires
  // data-stagger="hidden" (added only on the client) so this is inert in SSR.
  return (
    <Tag ref={ref} className={className} data-stagger-preset={preset}>
      {children}
    </Tag>
  );
}
