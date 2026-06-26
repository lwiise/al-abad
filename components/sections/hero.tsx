"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { CountUp } from "@/components/motion/count-up";
import type { StatRow } from "@/lib/database.types";
import { MediaFallback } from "./media-fallback";

// Heavy WebGL gradient — never SSR'd; only mounted on desktop + motion.
const MeshGradientBg = dynamic(
  () => import("@/components/motion/mesh-gradient-bg").then((m) => m.MeshGradientBg),
  { ssr: false },
);

const STAT_ICONS = [BookOpen, Users, Target];

export function Hero({
  headline,
  subhead,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  imageUrl,
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
  const [showGradient, setShowGradient] = useState(false);
  const topStats = stats.slice(0, 3);

  useEffect(() => {
    // Defer out of the effect body (and past first paint) before mounting WebGL.
    const id = requestAnimationFrame(() => {
      setShowGradient(
        window.matchMedia("(min-width: 1024px)").matches &&
          window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
      );
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Headline reveals by WORD (never per-char — Arabic stays joined), masked
        // rise. autoSplit re-splits after fonts load so positions are correct.
        const split = SplitText.create(headlineRef.current, {
          type: "words",
          mask: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              delay: 0.15,
            }),
        });
        gsap.from("[data-hero-rise]", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.25,
        });
        return () => split.revert();
      });

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-hero-portrait]", {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-background">
      {/* living atmosphere (or soft CSS fallback) */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {showGradient ? (
          <MeshGradientBg />
        ) : (
          <div className="aura absolute -start-32 -top-40 size-[36rem] rounded-full opacity-70" />
        )}
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 lg:min-h-[36rem] lg:grid-cols-[1fr_1.05fr_0.75fr]">
          {/* Text column */}
          <div className="z-10 flex flex-col gap-8 lg:justify-between lg:py-6 lg:-me-10">
            <div data-hero-rise className="flex items-center gap-3">
              <div className="flex flex-row-reverse">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-8 rounded-full bg-gradient-to-br from-plum to-teal ring-2 ring-background",
                      i > 0 && "-ms-2",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm text-foreground-muted">موثوق من آلاف المتدربين</span>
            </div>

            <div className="max-w-md space-y-5 text-start">
              <h1
                ref={headlineRef}
                className="text-4xl font-extrabold leading-[1.12] text-foreground [text-wrap:normal] sm:text-5xl"
              >
                {headline || "زواجٌ أكثر وعياً… وعلاقةٌ تدوم"}
              </h1>
              <p data-hero-rise className="leading-relaxed text-foreground-muted">
                {subhead ||
                  "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً متوازنةً وسعيدة."}
              </p>
              <div data-hero-rise className="flex flex-wrap gap-3">
                <Link
                  ref={magnetic}
                  href={primaryUrl || "#courses"}
                  className={cn(
                    buttonClasses("primary", "md"),
                    "rounded-full shadow-md transition-shadow hover:shadow-lg",
                  )}
                >
                  {primaryLabel || "ابدأ رحلتك"}
                </Link>
                <Link
                  href={secondaryUrl || "/نبذة"}
                  className={cn(buttonClasses("outline", "md"), "rounded-full")}
                >
                  {secondaryLabel || "تعرّف على الأستاذ علي"}
                </Link>
              </div>
            </div>
          </div>

          {/* Portrait (focal) */}
          <div
            data-hero-portrait
            className="relative order-first mx-auto h-[24rem] w-full max-w-xs lg:order-none lg:mx-0 lg:h-auto lg:min-h-[34rem] lg:max-w-none"
          >
            <div className="relative h-full w-full overflow-hidden rounded-t-[6rem] rounded-b-[2rem] border border-border-strong/50 bg-surface-strong/80 shadow-xl backdrop-blur-sm">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="الأستاذ علي العباد"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 460px"
                  className="object-cover"
                />
              ) : (
                <MediaFallback title="الأستاذ علي العباد" seed={2} />
              )}
            </div>
          </div>

          {/* Stats */}
          {topStats.length > 0 && (
            <div data-hero-rise className="flex items-center lg:justify-end">
              <ul className="space-y-7">
                {topStats.map((s, i) => {
                  const Icon = STAT_ICONS[i % STAT_ICONS.length];
                  return (
                    <li key={s.id} className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-secondary">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <CountUp
                          value={s.value}
                          className="block text-2xl font-extrabold tabular-nums text-foreground"
                        />
                        <span className="block text-xs text-foreground-subtle">{s.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
