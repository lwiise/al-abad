"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Recomputes positions for the remaining DECORATIVE GSAP ScrollTriggers (hero
 * parallax, SVG draw paths, connection art) after the page settles — fonts
 * swap, images load. Scroll reveals no longer depend on ScrollTrigger (they use
 * IntersectionObserver), so no self-heal is needed here. Renders nothing.
 */
export function ScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const timers = [setTimeout(refresh, 200), setTimeout(refresh, 800), setTimeout(refresh, 1600)];
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  return null;
}
