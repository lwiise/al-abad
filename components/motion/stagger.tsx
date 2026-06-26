"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const PRESETS = {
  rise: { opacity: 0, y: 24 },
  flip: { opacity: 0, rotationX: -35, y: 28, transformPerspective: 900, transformOrigin: "center top" },
} as const;

/**
 * Reveals its direct children in a staggered cascade on scroll-in. Renders the
 * element given by `as` (div by default) so list semantics (ul/ol) are kept.
 * `preset`: "rise" (fade+up, default) or "flip" (3D rotateX flip-in).
 * Honors prefers-reduced-motion (children stay visible).
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
  preset?: keyof typeof PRESETS;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current;
        if (!el || el.children.length === 0) return;
        gsap.from(el.children, {
          ...PRESETS[preset],
          duration: 0.75,
          ease: "power3.out",
          stagger: amount,
          scrollTrigger: { trigger: el, start: "clamp(top 82%)", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
