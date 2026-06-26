"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Abstract brand illustration for the Problem/Empathy section: two overlapping
 * forms (two people / a relationship) with a connecting heart and drifting dots.
 * Outlines draw on scroll; fills bob; dots float. Decorative (aria-hidden).
 */
export function ConnectionArt({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-draw]", {
          drawSVG: "0%",
          duration: 1.4,
          ease: "power2.inOut",
          stagger: 0.25,
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
        gsap.to("[data-float]", {
          y: "-=12",
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: "random" },
        });
        gsap.to("[data-bob]", {
          y: "+=8",
          duration: 4.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.7,
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} viewBox="0 0 400 360" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ca-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#583b66" />
          <stop offset="1" stopColor="#a551fc" />
        </linearGradient>
        <linearGradient id="ca-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d678b" />
          <stop offset="1" stopColor="#583b66" />
        </linearGradient>
      </defs>

      <g data-bob>
        <circle cx="150" cy="170" r="95" fill="url(#ca-a)" fillOpacity="0.16" />
      </g>
      <g data-bob>
        <circle cx="250" cy="195" r="95" fill="url(#ca-b)" fillOpacity="0.16" />
      </g>

      <circle data-draw cx="150" cy="170" r="95" stroke="url(#ca-a)" strokeWidth="2" strokeOpacity="0.65" />
      <circle data-draw cx="250" cy="195" r="95" stroke="url(#ca-b)" strokeWidth="2" strokeOpacity="0.65" />

      <path
        data-draw
        d="M200 168 c -10 -17 -35 -9 -35 11 c 0 17 23 29 35 38 c 12 -9 35 -21 35 -38 c 0 -20 -25 -28 -35 -11 z"
        stroke="#e04f64"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="#e04f64"
        fillOpacity="0.12"
      />

      <circle data-float cx="64" cy="78" r="6" fill="#a551fc" fillOpacity="0.5" />
      <circle data-float cx="336" cy="92" r="5" fill="#0d678b" fillOpacity="0.5" />
      <circle data-float cx="322" cy="300" r="7" fill="#583b66" fillOpacity="0.4" />
      <circle data-float cx="78" cy="298" r="5" fill="#e04f64" fillOpacity="0.45" />
    </svg>
  );
}
