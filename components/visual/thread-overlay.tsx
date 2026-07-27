"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

/**
 * الخيط — the thread. The one element the site should be remembered by.
 *
 * A single gold line runs the length of the homepage as TWO separate strands
 * that braid into one by the final CTA. The metaphor is the thesis: "علاقة تدوم"
 * — a relationship that lasts — drawn as one unbroken line.
 *
 * RTL-native: it enters top-right and exits bottom-left, so it reads in the same
 * direction as the language. A left-to-right timeline would read backwards here.
 *
 * SVG + ScrollTrigger + strokeDashoffset only — no WebGL, no video. The whole
 * effect is two paths and one scrubbed tween, which is the point: it buys the
 * depth a 3D scene would, at a fraction of the cost on a mid-range Android.
 *
 * Fails safe: with no JS, no ScrollTrigger, or reduced motion the thread renders
 * FULLY DRAWN and static rather than invisible — same principle as `use-reveal`.
 */
export function ThreadOverlay() {
  const ref = useRef<SVGSVGElement>(null);
  // Height must track the real document, which only settles after fonts swap
  // and images load. Start at 0 and measure on the client.
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const measure = () =>
      setHeight(
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          window.innerHeight,
        ),
      );
    measure();

    // ResizeObserver on <body> catches content reflow (image loads, font swap,
    // accordion opens) that a plain resize listener misses.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg || !height) return;

      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("[data-strand]"));
      if (!paths.length) return;

      // Prime every strand fully drawn first. If the media query below does not
      // match, this is the state that stays — reduced motion gets the finished
      // thread, not a blank overlay.
      for (const p of paths) {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: 0 });
      }

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tweens = paths.map((p) => {
          const len = p.getTotalLength();
          return gsap.fromTo(
            p,
            // Starts ~12% drawn rather than at zero: the thread is supposed to
            // already be present in the hero as two strands, and a completely
            // hidden path means the signature element is invisible on the one
            // screen everyone sees.
            { strokeDashoffset: len * 0.88 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            },
          );
        });

        return () => {
          for (const t of tweens) {
            t.scrollTrigger?.kill();
            t.kill();
          }
          // Leave the thread drawn, never half-erased, if the query stops matching.
          for (const p of paths) gsap.set(p, { strokeDashoffset: 0 });
        };
      });

      // Geometry depends on document height, which the effect above re-measures.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: ref, dependencies: [height] },
  );

  if (!height) return null;

  // viewBox is 100 wide by document height, with preserveAspectRatio="none", so
  // X is effectively a percentage of viewport width and Y is real pixels. That
  // keeps the curve identical at every breakpoint without recomputing paths.
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      // z-[1], NOT a negative z-index: every section paints an opaque
      // background, and the hero additionally sets `isolate`, so anything
      // behind them is never seen. The thread therefore rides just above
      // section backgrounds and below the header (z-50) and float (z-40) — a
      // 1.5px line at 35% opacity reads as a thread through the page rather
      // than an overlay on it.
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      fill="none"
    >
      {/* Two strands: enter top-RIGHT (x=100 in RTL reading order), diverge
          through the page, then converge to the same control points near 70%
          depth and finish as one line bottom-left. */}
      <path
        data-strand
        d={strand(height, -1)}
        stroke="var(--color-gold)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      <path
        data-strand
        d={strand(height, 1)}
        stroke="var(--color-gold)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * One strand, mirrored around a shared spine by `side` (-1 or 1). The two are
 * identical from 70% down, which is what makes them read as braiding into one
 * rather than merely crossing.
 */
function strand(h: number, side: 1 | -1): string {
  const y = (pct: number) => Math.round(h * pct);
  const spread = 6 * side; // horizontal divergence, in viewBox units (~% of width)

  return [
    `M 88 0`,
    `C ${70 + spread} ${y(0.1)}, ${78 + spread} ${y(0.2)}, ${58 + spread} ${y(0.3)}`,
    `S ${30 + spread} ${y(0.45)}, ${46 + spread} ${y(0.58)}`,
    // Converged: no `spread` past this point — both strands share every value.
    `S 22 ${y(0.72)}, 34 ${y(0.82)}`,
    `S 14 ${y(0.93)}, 8 ${y(1)}`,
  ].join(" ");
}
