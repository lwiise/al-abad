"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Shared perspective for scenes and their layers, so counter-scaling matches. */
export const SCENE_PERSPECTIVE = 1000;

/**
 * A real 3D stage. Establishes `perspective` + `transform-style: preserve-3d`
 * so `DepthLayer` children can sit at genuine Z distances, then rotates the
 * whole stage a few degrees toward the pointer. Because the layers are at
 * different depths, that single rotation parallaxes them against each other —
 * this is where the sense of physical depth comes from, at no runtime cost
 * beyond one transform.
 *
 * Desktop + no-reduced-motion only; otherwise it is an ordinary div and the
 * layers just stack as laid out.
 *
 * Note: `preserve-3d` defeats `overflow: hidden` clipping on descendants, so
 * clip on a wrapper *outside* the scene rather than on the scene itself.
 */
export function Scene3D({
  as,
  className,
  max = 5,
  perspective = SCENE_PERSPECTIVE,
  children,
}: {
  as?: ElementType;
  className?: string;
  /** Max rotation in degrees at the far edge of the element. */
  max?: number;
  perspective?: number;
  children: ReactNode;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" });

        // Track the pointer across the viewport rather than the element itself:
        // a full-bleed hero is wider than the cursor ever travels within it, and
        // viewport-relative tracking keeps the scene responding everywhere.
        const onMove = (e: PointerEvent) => {
          const px = (e.clientX / window.innerWidth) * 2 - 1;
          const py = (e.clientY / window.innerHeight) * 2 - 1;
          ry(px * max);
          rx(-py * max);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
          window.removeEventListener("pointermove", onMove);
          gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.4 });
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  const style: CSSProperties = {
    perspective: `${perspective}px`,
    transformStyle: "preserve-3d",
  };

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
