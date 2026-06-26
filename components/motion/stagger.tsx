"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Reveals its direct children in a staggered cascade on scroll-in. Renders the
 * element given by `as` (div by default) so list semantics (ul/ol) are kept.
 * Honors prefers-reduced-motion (children stay visible).
 */
export function Stagger({
  as,
  className,
  children,
  amount = 0.1,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  amount?: number;
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
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: amount,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
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
