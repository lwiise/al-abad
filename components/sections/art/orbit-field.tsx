"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { pauseOffscreen } from "@/components/motion/pause-offscreen";

/**
 * Depth-layered orbital rings — a denser evolution of `AiOrbit`.
 *
 * Where `AiOrbit` spins two flat rings, this tilts each ring on `rotateX` and
 * gives them different radii, speeds and directions, so they read as orbits in
 * space rather than as concentric circles on a page. Counter-rotating pairs are
 * what stop it looking like a loading spinner.
 *
 * Rings are inline SVG at brand hues; everything animated is a transform.
 */
export function OrbitField({
  className,
  tone = "violet",
}: {
  className?: string;
  tone?: "violet" | "teal" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const stroke =
    tone === "violet" ? "#a551fc" : tone === "teal" ? "#0d678b" : "rgba(255,255,255,0.7)";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const spins = [
          gsap.to("[data-ring='0']", { rotate: 360, duration: 30, ease: "none", repeat: -1 }),
          gsap.to("[data-ring='1']", { rotate: -360, duration: 42, ease: "none", repeat: -1 }),
          gsap.to("[data-ring='2']", { rotate: 360, duration: 54, ease: "none", repeat: -1 }),
          gsap.to("[data-orbit-node]", {
            scale: 1.35,
            opacity: 0.45,
            duration: 2.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: { each: 0.5, from: "random" },
          }),
        ];

        const stopPausing = pauseOffscreen(root, spins);
        return () => {
          stopPausing();
          spins.forEach((s) => s.kill());
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
      className={cn("pointer-events-none absolute", className)}
      style={{ perspective: "700px" }}
    >
      <svg viewBox="0 0 200 200" className="size-full overflow-visible" fill="none">
        {/* Each ring tilts differently, so the set reads as depth not as rings. */}
        <g data-ring="0" style={{ transform: "rotateX(62deg)", transformOrigin: "100px 100px" }}>
          <circle cx="100" cy="100" r="88" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" />
          <circle data-orbit-node cx="188" cy="100" r="4" fill={stroke} fillOpacity="0.8" />
        </g>
        <g data-ring="1" style={{ transform: "rotateX(48deg)", transformOrigin: "100px 100px" }}>
          <circle cx="100" cy="100" r="66" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" />
          <circle data-orbit-node cx="34" cy="100" r="3.5" fill="#e04f64" fillOpacity="0.85" />
        </g>
        <g data-ring="2" style={{ transform: "rotateX(70deg)", transformOrigin: "100px 100px" }}>
          <circle cx="100" cy="100" r="44" stroke={stroke} strokeOpacity="0.5" strokeWidth="1" />
          <circle data-orbit-node cx="144" cy="100" r="3" fill={stroke} fillOpacity="0.9" />
        </g>
        <circle data-orbit-node cx="100" cy="100" r="6" fill={stroke} fillOpacity="0.5" />
      </svg>
    </div>
  );
}
