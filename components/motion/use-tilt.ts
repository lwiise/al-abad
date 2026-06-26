"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Subtle pointer-tracked 3D tilt + lift for cards. Desktop + no-reduced-motion
 * only. Returns a ref to attach to the card element.
 */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set(el, { transformPerspective: 800, transformOrigin: "center" });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2" });
        const ty = gsap.quickTo(el, "y", { duration: 0.4, ease: "power2" });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          ry(px * max);
          rx(-py * max);
        };
        const onEnter = () => ty(-6);
        const onLeave = () => {
          rx(0);
          ry(0);
          ty(0);
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return ref;
}
