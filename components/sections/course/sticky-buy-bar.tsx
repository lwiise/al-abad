"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

/**
 * Slim purchase bar that slides in once the hero scrolls out of view, and hides
 * again while the hero or the offer section is on screen (so it never competes
 * with the in-view CTA). Sits just under the sticky site header.
 */
export function StickyBuyBar({
  title,
  priceLabel,
  originalLabel,
  ctaUrl,
}: {
  title: string;
  priceLabel: string | null;
  originalLabel: string | null;
  ctaUrl: string | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("course-hero");
    const offer = document.getElementById("course-offer");
    const state = { hero: !!hero, offer: false };
    const update = () => setVisible(!state.hero && !state.offer);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target.id === "course-hero") state.hero = e.isIntersecting;
          if (e.target.id === "course-offer") state.offer = e.isIntersecting;
        }
        update();
      },
      { rootMargin: "-72px 0px 0px 0px" },
    );

    if (hero) obs.observe(hero);
    if (offer) obs.observe(offer);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-16 z-40 border-b border-border bg-background/90 backdrop-blur transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground">{title}</p>
          {priceLabel && (
            <p className="text-sm">
              <span className="font-bold text-foreground">{priceLabel}</span>
              {originalLabel && (
                <span className="ms-2 text-foreground-subtle line-through">{originalLabel}</span>
              )}
            </p>
          )}
        </div>
        <a
          href={ctaUrl || "/تواصل"}
          target={ctaUrl ? "_blank" : undefined}
          rel={ctaUrl ? "noopener noreferrer" : undefined}
          className={cn(buttonClasses("danger", "md"), "shrink-0 rounded-full")}
        >
          {ctaUrl ? "اشترك الآن" : "للتسجيل تواصل معنا"}
        </a>
      </div>
    </div>
  );
}
