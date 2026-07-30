"use client";

import { useRef, type ComponentProps, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";

/** Seconds between consecutive lines. */
const STAGGER = 0.085;

/**
 * Line-by-line reveal from behind a mask.
 *
 * This is the one gesture that most separates an authored page from a
 * templated one, and it is the thing the site was missing: a heading that
 * arrives as LINES OF TYPE — each one rising out from behind its own edge, in
 * reading order — reads as typeset. The same heading faded up as a rectangle
 * reads as a div that happens to contain words. Every site in the reference set
 * does this to its headings and almost nothing else.
 *
 * ## Arabic splits by LINE. Never by character.
 *
 * Arabic is cursive: letters join, and their shapes change depending on what
 * they join to. Splitting a word into per-character elements severs those
 * joins and renders the word in isolated forms — the same destruction
 * `letter-spacing` causes, which is why globals.css nulls it site-wide. The
 * per-character stagger that half the reference sites use on their Latin
 * display type is therefore not available here at any quality, and no amount of
 * tuning makes it available.
 *
 * Lines are safe, and they are safe for a structural reason rather than a lucky
 * one: a line break can only fall where the text was already allowed to break,
 * so wrapping whole rendered lines never lands inside a join. `course-hero.tsx`
 * reaches the same conclusion from the other direction and splits by words.
 *
 * Lines are also the better gesture regardless of script. Per-character motion
 * on a 40px headline is confetti; per-line motion is a masthead.
 *
 * ## The mask is the point
 *
 * `mask: "lines"` wraps each line in its own `overflow: hidden` box, so the
 * line travels a full 100% of its own height and is CLIPPED by its own edge on
 * the way — it emerges from the line above it rather than materialising in
 * place. Without the mask the same tween is a stagger of fading rows, which is
 * what the site already had 34 of.
 *
 * ## Why the fonts are waited on
 *
 * `autoSplit` re-splits when the font actually swaps. Splitting before that
 * measures the FALLBACK font's line boxes, so on a slow connection the masks
 * are cut at the wrong heights and the reveal clips mid-glyph — the failure
 * that makes this effect look broken rather than absent. It also re-splits on
 * resize, which is what keeps the masks correct after an orientation change.
 *
 * ## Failure paths leave the type alone
 *
 * Reduced motion never splits and never tweens, so the heading is plain
 * server-rendered markup. No JS, a SplitText failure, or a font that never
 * loads all land in the same place: fully visible text. SplitText's own
 * `aria` handling keeps the accessible name intact, so a screen reader reads
 * the heading as one string either way.
 *
 * ## Usage
 *
 * Mark the text-bearing elements, not the wrapper — the same convention
 * `Sequence` uses with `data-seq-item`:
 *
 * ```tsx
 * <LineReveal>
 *   <h2 data-lines>…</h2>
 *   <p data-lines>…</p>
 * </LineReveal>
 * ```
 *
 * Children are rendered on the SERVER and handed in, so this costs a wrapper
 * and no serialisation.
 */
export function LineReveal({
  as,
  className,
  children,
  delay = 0,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Seconds to hold before the first line moves. */
  delay?: number;
  // Forwarded so this can stand in for the plain wrapper it replaces —
  // `SectionHeading` swaps between the two and passes its spread either way.
} & Omit<ComponentProps<"div">, "children" | "className">) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const targets = root.querySelectorAll<HTMLElement>("[data-lines]");
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const splits: SplitText[] = [];

        targets.forEach((target, i) => {
          const split = SplitText.create(target, {
            // LINES ONLY — see the note above. Never "chars".
            type: "lines",
            mask: "lines",
            // Re-split on font swap and on resize, so the masks are always cut
            // at the real line height.
            autoSplit: true,
            linesClass: "lr-line",
            onSplit: (self) =>
              // `.from()` renders its start state immediately, so the lines are
              // already behind their masks at layout time and there is no
              // flash of finished-then-hidden type.
              gsap.from(self.lines, {
                yPercent: 100,
                duration: 0.9,
                ease: "power3.out",
                stagger: STAGGER,
                delay: delay + i * STAGGER,
                // Promoted for the ~1s it is moving and demoted immediately
                // after. SplitText keeps its wrappers alive until the component
                // unmounts, so anything set once here would never come back
                // off — see the note in globals.css. `onStart` fires when the
                // ScrollTrigger releases the tween, not when it is built.
                onStart: () => gsap.set(self.lines, { willChange: "transform" }),
                onComplete: () => gsap.set(self.lines, { willChange: "auto" }),
                scrollTrigger: {
                  trigger: root,
                  // Matches the -12% rootMargin `useReveal` uses, so a
                  // heading and the block under it are triggered off the same
                  // line and the section arrives as one thought.
                  start: "top 88%",
                  once: true,
                },
              }),
          });
          splits.push(split);
        });

        return () => splits.forEach((s) => s.revert());
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
