"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { cn, splitStat } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { pauseOffscreen } from "@/components/motion/pause-offscreen";
import { Scene3D } from "@/components/motion/scene-3d";
import { DepthLayer } from "@/components/motion/depth-layer";
import { CountUp } from "@/components/motion/count-up";
import { Grain } from "./art/grain";
import type { StatRow } from "@/lib/database.types";
import { MediaFallback } from "./media-fallback";

const STAT_ICONS = [BookOpen, Users, Target];

export function Hero({
  headline,
  subhead,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
  imageUrl,
  trustBadge,
  stats = [],
}: {
  headline?: string | null;
  subhead?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  imageUrl?: string | null;
  trustBadge?: string | null;
  stats?: StatRow[];
}) {
  const root = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const magnetic = useMagnetic<HTMLAnchorElement>();
  const topStats = stats.slice(0, 3);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Words, never characters — per-character wrapping breaks Arabic letter
        // joining. No mask either: masking clips diacritics and descenders.
        // The rotateX hinge swings words in from depth instead of sliding them.
        const split = SplitText.create(headlineRef.current, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              y: 30,
              opacity: 0,
              rotateX: -55,
              transformPerspective: 700,
              transformOrigin: "50% 100%",
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.08,
              delay: 0.1,
            }),
        });
        gsap.from("[data-hero-rise]", {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.3,
        });
        return () => split.revert();
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const drift = gsap.to("[data-orb]", {
          y: "+=26",
          x: "+=14",
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 1.6, from: "random" },
        });
        const stopPausing = pauseOffscreen(root.current, [drift]);

        // Scroll-out parallax. Each layer leaves at its own rate — the aurora
        // barely moves, the orbs lag well behind — which is what sells the
        // depth that the pointer rotation only hints at.
        const scrub = {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        } as const;

        const layers = [
          gsap.to("[data-hero-aurora]", { yPercent: 10, ease: "none", scrollTrigger: scrub }),
          gsap.to("[data-hero-orbs]", { yPercent: 26, ease: "none", scrollTrigger: scrub }),
        ];

        return () => {
          stopPausing();
          drift.kill();
          layers.forEach((l) => {
            l.scrollTrigger?.kill();
            l.kill();
          });
        };
      });

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const scrub = {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        } as const;
        const tweens = [
          gsap.to("[data-hero-portrait]", { yPercent: -10, ease: "none", scrollTrigger: scrub }),
          gsap.to("[data-hero-halo]", { yPercent: 18, ease: "none", scrollTrigger: scrub }),
        ];
        return () =>
          tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden bg-background">
      {/* Background stage: aurora and orbs sit at real Z, so one pointer
          rotation parallaxes them against each other. Clipping stays on the
          section — preserve-3d defeats overflow on descendants. */}
      <Scene3D max={6} className="pointer-events-none absolute inset-0 -z-10">
        <DepthLayer z={-320} className="absolute inset-0">
          <div data-hero-aurora className="hero-aurora absolute inset-0" aria-hidden="true" />
        </DepthLayer>

        <DepthLayer z={-140} className="absolute inset-0">
          <div data-hero-orbs className="absolute inset-0" aria-hidden="true">
            <div
              data-orb
              className="absolute -top-12 start-[16%] size-72 rounded-full bg-highlight/20 blur-3xl"
            />
            <div
              data-orb
              className="absolute top-1/3 end-[6%] size-80 rounded-full bg-secondary/15 blur-3xl"
            />
            <div
              data-orb
              className="absolute -bottom-10 start-[8%] size-72 rounded-full bg-primary/15 blur-3xl"
            />
          </div>
        </DepthLayer>
      </Scene3D>

      {/* Grain gives the flat gradient wash a surface — the cheapest antidote
          to the plasticky look large CSS gradients have on their own. */}
      <Grain className="pointer-events-none absolute inset-0 -z-10 size-full" />

      {/* fade the hero into the next (surface) section — no hard seam */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-surface"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 lg:min-h-[36rem] lg:grid-cols-[1fr_1.05fr_0.75fr]">
          {/* Text column */}
          <div className="z-10 flex flex-col gap-8 lg:justify-between lg:py-6 lg:-me-10">
            <div
              data-hero-rise
              className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-background/70 px-4 py-1.5 backdrop-blur"
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
              <span className="text-sm text-foreground-muted">
                {trustBadge || "موثوق من آلاف المتدربين"}
              </span>
            </div>

            <div className="max-w-md space-y-5 text-start">
              <h1
                ref={headlineRef}
                style={{ lineHeight: 1.5 }}
                className="pb-1 text-4xl font-extrabold text-foreground [text-wrap:normal] sm:text-5xl lg:text-6xl"
              >
                {headline || "زواج أكثر وعياً… وعلاقة تدوم"}
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
                    "rounded-full shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl",
                  )}
                >
                  {primaryLabel || "ابدأ رحلتك"}
                </Link>
                <Link
                  href={secondaryUrl || "/نبذة"}
                  className={cn(
                    buttonClasses("outline", "md"),
                    "rounded-full bg-background/70 backdrop-blur",
                  )}
                >
                  {secondaryLabel || "تعرّف على الأستاذ علي"}
                </Link>
              </div>
            </div>
          </div>

          {/* Portrait (focal, centered) */}
          <div
            data-hero-portrait
            className="relative order-first mx-auto h-[24rem] w-full max-w-xs lg:order-none lg:mx-0 lg:h-auto lg:min-h-[34rem] lg:max-w-none"
          >
            {imageUrl ? (
              <>
                {/* Soft brand halo behind the cutout so it blends into the page
                    (no frame). It breathes slowly and drifts at its own scroll
                    rate, so the portrait reads as standing in front of
                    something rather than pasted onto it. */}
                <div
                  data-hero-halo
                  aria-hidden="true"
                  className="aura-breathe absolute inset-x-0 bottom-0 top-6 -z-10 rounded-[100%] bg-gradient-to-b from-highlight/25 via-highlight/10 to-transparent blur-3xl"
                />
                <Image
                  src={imageUrl}
                  alt="الأستاذ علي العباد"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 460px"
                  className="object-contain object-bottom"
                />
              </>
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded-t-[6rem] rounded-b-[2rem] border border-border-strong/50 bg-surface-strong/70">
                <MediaFallback title="الأستاذ علي العباد" seed={2} />
              </div>
            )}
          </div>

          {/* Stats */}
          {topStats.length > 0 && (
            <div data-hero-rise className="flex items-center lg:justify-end">
              <ul className="space-y-7">
                {topStats.map((s, i) => {
                  const Icon = STAT_ICONS[i % STAT_ICONS.length];
                  const { prefix, num, suffix } = splitStat(s.value);
                  return (
                    <li key={s.id} className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/70 text-secondary backdrop-blur">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block text-2xl font-extrabold tabular-nums text-foreground">
                          {num != null ? (
                            <CountUp
                              value={num}
                              prefix={prefix}
                              suffix={suffix ? ` ${suffix}` : ""}
                            />
                          ) : (
                            s.value
                          )}
                        </span>
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
