"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { pauseOffscreen } from "@/components/motion/pause-offscreen";

type Tone = "brand" | "teal" | "violet" | "warm";

// Blob palettes per tone. Deliberately NOT a purple-on-white wash — each tone
// mixes two brand hues so the result reads as our palette, not as a default.
const TONES: Record<Tone, string[]> = {
  brand: ["bg-primary/25", "bg-highlight/20", "bg-secondary/20"],
  teal: ["bg-secondary/25", "bg-primary/15", "bg-highlight/15"],
  violet: ["bg-highlight/25", "bg-primary/20", "bg-secondary/15"],
  warm: ["bg-accent/20", "bg-highlight/20", "bg-primary/15"],
};

// Fixed positions/sizes — no randomness, so server and client always agree and
// the composition stays art-directed rather than accidental.
const SHAPES = [
  "start-[8%] top-[-12%] size-[26rem]",
  "end-[4%] top-[22%] size-[22rem]",
  "start-[24%] bottom-[-16%] size-[28rem]",
];

/**
 * Drifting gradient blobs — the workhorse backdrop of this pass.
 *
 * Replaces flat section fills with something that slowly breathes, giving depth
 * to sections that have no photography to carry them. Blur is baked into the
 * class list rather than animated (animating blur is a repaint trap); only
 * transforms move.
 *
 * Drift is deliberately symmetric ambient motion on both axes — these are
 * blurred decorative shapes with no reading direction, so the RTL rule against
 * horizontal translation does not apply the way it does to content. The
 * existing hero orbs already drift this way.
 */
export function GradientMesh({
  tone = "brand",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = TONES[tone];

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const drift = gsap.to("[data-mesh-blob]", {
          y: "+=34",
          x: "+=20",
          scale: 1.08,
          duration: 9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 2.1, from: "random" },
        });

        const stopPausing = pauseOffscreen(root, [drift]);
        return () => {
          stopPausing();
          drift.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          data-mesh-blob
          className={cn("absolute rounded-full blur-3xl", shape, colors[i % colors.length])}
        />
      ))}
    </div>
  );
}
