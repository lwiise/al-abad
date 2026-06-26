"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Recomputes ScrollTrigger positions after the page settles (fonts swap, lazy
 * images load) so scroll reveals fire at the right spots — especially the last
 * sections. Mounted once in the marketing layout. Renders nothing.
 */
export function ScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const timers = [setTimeout(refresh, 200), setTimeout(refresh, 800), setTimeout(refresh, 1600)];
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
