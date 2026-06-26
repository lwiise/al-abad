"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Keeps GSAP scroll reveals reliable. Mounted once in the marketing layout.
 *
 *  1. Recomputes ScrollTrigger positions after the page settles (fonts swap,
 *     images load) so reveals fire at the right spots — especially the last
 *     sections, whose start can be mismeasured before layout stabilises.
 *  2. Self-heals "stuck hidden" reveals: a `gsap.from()` leaves its target at
 *     opacity 0 until its trigger fires. If the trigger never fires (a known
 *     edge case for the bottom-most section — e.g. the blog cards), the content
 *     stays invisible. So whenever an element is already well inside the
 *     viewport but its reveal hasn't played, we force it to its visible end
 *     state. Runs after settle, on scroll, and on resize.
 *
 * Renders nothing.
 */
export function ScrollRefresh() {
  useEffect(() => {
    const healStuck = () => {
      const vh = window.innerHeight;
      for (const st of ScrollTrigger.getAll()) {
        const anim = st.animation;
        const el = st.trigger as Element | undefined;
        // Only un-played reveals that aren't mid-animation can be "stuck".
        if (!anim || !el || st.isActive || anim.progress() > 0) continue;
        const rect = el.getBoundingClientRect();
        // Element sits clearly inside (or above) the viewport yet never
        // revealed → snap it to visible. The 0.7 threshold stays below the
        // normal trigger line (top 82–85%) so elements just entering view keep
        // their scroll-in animation.
        if (rect.bottom > 0 && rect.top < vh * 0.7) {
          anim.progress(1);
        }
      }
    };

    const refresh = () => {
      ScrollTrigger.refresh();
      healStuck();
    };

    const timers = [setTimeout(refresh, 200), setTimeout(refresh, 800), setTimeout(refresh, 1600)];
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        healStuck();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", refresh);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
