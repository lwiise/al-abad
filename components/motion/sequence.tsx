"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useReveal } from "./use-reveal";

/**
 * Seconds between consecutive items. Deliberately short: this is a section
 * assembling itself, not a slideshow. Past ~0.1s the eye starts reading the
 * gap instead of the content.
 */
const STEP = 0.07;

/**
 * Ceiling on the accumulated delay. Without it a long list (the FAQ ships a
 * dozen questions) would still be arriving a second and a half after the
 * section landed, which reads as jank rather than as choreography. Items past
 * the cap arrive together — by then they are below the fold anyway.
 */
const MAX_DELAY = 0.45;

/**
 * Sequenced entrance for a composed block.
 *
 * The third of the three scroll-entrance primitives, and the one the other two
 * cannot express:
 *
 * - `Reveal`  — one element, moved as a unit.
 * - `Stagger` — a flat row of DIRECT children, cascaded.
 * - `Sequence` — arbitrary descendants at ANY depth, in reading order.
 *
 * That last case is what a built section actually is: a chip, a headline, a
 * paragraph, a form, an illustration, nested several levels down inside a
 * padded card. Wrapping such a block in `Reveal` — which is what the AI teaser,
 * the closing CTA, the testimonials header and the FAQ all did — slides the
 * whole slab up as one rectangle. Nothing is revealed; the section just moves.
 * Marking the parts with `data-seq-item` lets them arrive in the order they are
 * meant to be read.
 *
 * Mark the parts, not the wrappers: an item nested inside another item gets
 * both transforms and drifts.
 *
 * No new observer logic — this is `useReveal` with a different attribute, so
 * every guard it already makes holds here too: the content renders VISIBLE and
 * is hidden only once JS has confirmed it can reveal it again, so no JS, no
 * IntersectionObserver, slow hydration or `prefers-reduced-motion` all leave
 * the section fully rendered. The root takes `data-seq`; the CSS in globals.css
 * selects the items as its DESCENDANTS, which is what buys the arbitrary depth.
 */
export function Sequence({
  as,
  className,
  children,
  step = STEP,
  maxDelay = MAX_DELAY,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Seconds between consecutive items. */
  step?: number;
  /** Ceiling on the accumulated delay, in seconds. */
  maxDelay?: number;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, {
    attr: "data-seq",
    // Document order === reading order, which is the whole point. Set on the
    // real DOM nodes rather than forwarded as props, so items can be plain
    // markup — or components that spread `...props` — without either one
    // needing to know this primitive exists.
    prepare: (el) => {
      const items = el.querySelectorAll<HTMLElement>("[data-seq-item]");
      items.forEach((item, i) => {
        // Rounded: 3 × 0.07 is 0.21000000000000002 in binary floating point,
        // and that lands in the DOM verbatim for anyone who inspects it.
        const delay = Math.min(i * step, maxDelay).toFixed(3);
        item.style.setProperty("--seq-delay", `${delay}s`);
      });
    },
  });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
