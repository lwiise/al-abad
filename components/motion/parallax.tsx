"use client";

import type { ComponentProps, ElementType, ReactNode } from "react";
import { useParallax, type ParallaxOptions } from "./use-parallax";

/**
 * Scroll-linked drift for a decorative or figurative layer.
 *
 * A pass-through wrapper, the same shape `FloatGroup` already uses and for the
 * same reason: its children are rendered on the SERVER and handed in, so a
 * server component can put one layer of itself on a scroll-linked transform
 * without becoming a client component. `hero.tsx` is the case that forces this
 * — it is deliberately server-only so nothing above the fold has to hydrate,
 * and that property is worth more than any animation.
 *
 * Vertical only. `yPercent` is unaffected by writing direction, so there is no
 * RTL variant to get wrong — which is also why the site's drift is vertical
 * rather than the horizontal kind that shows up on studio sites.
 *
 * See `use-parallax.ts` for the speed ceiling and the reduced-motion contract.
 */
export function Parallax({
  as,
  className,
  children,
  speed,
  mode,
  from,
  minWidth,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  // Forwarded (style, aria-hidden, …) so this is a drop-in replacement for the
  // element it wraps rather than another box around it — which matters in
  // `hero.tsx`, where the layers that drift are absolutely positioned and
  // carry their own type styles.
} & ParallaxOptions &
  Omit<ComponentProps<"div">, "children" | "className">) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useParallax<HTMLElement>({ speed, mode, from, minWidth });

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
