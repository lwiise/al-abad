"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { CountUp } from "@/components/motion/count-up";
import type { StatRow } from "@/lib/database.types";

export function Hero({
  headline,
  subhead,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  stats = [],
}: {
  headline?: string | null;
  subhead?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  imageUrl?: string | null;
  stats?: StatRow[];
}) {
  const root = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const magnetic = useMagnetic<HTMLAnchorElement>();
  const topStats = stats.slice(0, 4);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Word-level masked reveal (Arabic stays joined). autoSplit handles fonts.
        const split = SplitText.create(headlineRef.current, {
          type: "words",
          mask: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              opacity: 0,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.09,
              delay: 0.1,
            }),
        });
        gsap.from("[data-hero-rise]", {
          opacity: 0,
          y: 22,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.35,
        });
        return () => split.revert();
      });

      // Slow floating orbs — desktop + motion only (no animated blur on mobile).
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-orb]", {
          y: "+=26",
          x: "+=14",
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 1.6, from: "random" },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden bg-background">
      {/* aurora wash */}
      <div className="hero-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      {/* floating brand orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div data-orb className="absolute -top-12 start-[18%] size-72 rounded-full bg-highlight/20 blur-3xl" />
        <div data-orb className="absolute top-1/3 end-[8%] size-80 rounded-full bg-secondary/15 blur-3xl" />
        <div data-orb className="absolute -bottom-10 start-[10%] size-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <div
          data-hero-rise
          className="inline-flex items-center gap-3 rounded-full border border-border bg-background/70 px-4 py-1.5 backdrop-blur"
        >
          <div className="flex flex-row-reverse">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "size-6 rounded-full bg-gradient-to-br from-plum to-teal ring-2 ring-background",
                  i > 0 && "-ms-2",
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-sm text-foreground-muted">موثوق من آلاف المتدربين</span>
        </div>

        <h1
          ref={headlineRef}
          className="mt-8 text-5xl font-extrabold leading-[1.08] text-foreground [text-wrap:normal] sm:text-6xl lg:text-7xl"
        >
          {headline || "زواجٌ أكثر وعياً… وعلاقةٌ تدوم"}
        </h1>

        <p data-hero-rise className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
          {subhead ||
            "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً زوجيةً متوازنةً وسعيدة، عبر دوراتٍ عمليّة تأخذ بيدك خطوة بخطوة."}
        </p>

        <div data-hero-rise className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            ref={magnetic}
            href={primaryUrl || "#courses"}
            className={cn(
              buttonClasses("primary", "md"),
              "rounded-full shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl",
            )}
          >
            {primaryLabel || "ابدأ رحلتك"}
          </Link>
          <Link
            href={secondaryUrl || "/نبذة"}
            className={cn(buttonClasses("outline", "md"), "rounded-full bg-background/70 backdrop-blur")}
          >
            {secondaryLabel || "تعرّف على الأستاذ علي"}
          </Link>
        </div>

        {topStats.length > 0 && (
          <div data-hero-rise className="mt-14 flex flex-wrap items-center justify-center gap-3">
            {topStats.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-background/60 px-6 py-3 text-center shadow-sm backdrop-blur"
              >
                <CountUp
                  value={s.value}
                  className="block text-2xl font-extrabold tabular-nums text-primary"
                />
                <span className="mt-0.5 block text-xs text-foreground-subtle">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
