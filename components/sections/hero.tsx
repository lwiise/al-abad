"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
import { NajdiBackdrop } from "./art/najdi-backdrop";
import type { StatRow } from "@/lib/database.types";

const STAT_ICONS = [BookOpen, Users, Target];

const DEFAULT_HEADLINE = "زواج أكثر وعياً… وعلاقة تدوم";

/**
 * Split the headline at the ellipsis so the tail can be set in Ruqʿah.
 *
 * The headline is CMS copy, so this cannot hard-code "علاقة تدوم" — an editor
 * may change it. Splitting on "…" keeps the calligraphic line editable and
 * degrades cleanly: no ellipsis means no second part, and the whole headline
 * renders in the display face with no calligraphy at all.
 */
function splitHeadline(value: string): { lead: string; calligraphic: string | null } {
  const i = value.indexOf("…");
  if (i === -1) return { lead: value, calligraphic: null };
  const lead = value.slice(0, i + 1).trim();
  const tail = value.slice(i + 1).trim();
  return { lead, calligraphic: tail || null };
}

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
  const magnetic = useMagnetic<HTMLAnchorElement>();
  const topStats = stats.slice(0, 3);
  const { lead, calligraphic } = splitHeadline(headline || DEFAULT_HEADLINE);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ONE entrance moment, per the motion spec. No per-word or per-letter
      // text animation — Arabic is cursive and letter-level splitting breaks
      // joining, and word-level here would be a fifth moment the spec doesn't
      // call for.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();

        tl.from("[data-hero-calligraphy]", {
          opacity: 0,
          scale: 0.96,
          duration: 0.9,
          ease: "power3.out",
          transformOrigin: "100% 50%", // grows from the right — RTL reading order
        });

        // clip-path wipe from the right, matching RTL reading direction.
        tl.from(
          "[data-hero-visual]",
          {
            clipPath: "inset(0 0 0 100%)",
            duration: 1.1,
            ease: "power3.inOut",
          },
          0.12,
        );

        tl.from(
          "[data-hero-rise]",
          {
            opacity: 0,
            y: 18,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          },
          0.2,
        );

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-ink-deep text-white"
    >
      {/* Two shafts of light in a Najdi plaster wall, brighter where they
          cross. Replaces the two radial washes: same job, but it says
          something rather than just tinting the corner. */}
      <NajdiBackdrop className="-z-10" />

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Text column */}
          <div className="text-start">
            <div
              data-hero-rise
              className="inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur"
            >
              <div className="flex flex-row-reverse">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-6 rounded-full bg-gradient-to-br from-aubergine to-violet-accent ring-2 ring-ink-deep",
                      i > 0 && "-ms-2",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm text-white/70">
                {trustBadge || "موثوق من آلاف المتدربين"}
              </span>
            </div>

            <h1 className="mt-7 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              <span data-hero-rise className="block text-white/90">
                {lead}
              </span>
              {calligraphic && (
                <span
                  data-hero-calligraphy
                  // Ruqʿah needs far more vertical room than a sans: its
                  // descenders and sweeping baseline sit well outside the em
                  // box, so this carries its own generous leading and padding
                  // rather than inheriting the heading scale's.
                  className="mt-3 block font-calligraphy text-coral"
                  style={{ lineHeight: 1.9, paddingBottom: "0.15em" }}
                >
                  {calligraphic}
                </span>
              )}
            </h1>

            <p
              data-hero-rise
              className="mt-6 max-w-lg leading-relaxed text-white/65"
            >
              {subhead ||
                "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً متوازنةً وسعيدة."}
            </p>

            <div data-hero-rise className="mt-9 flex flex-wrap gap-3">
              {/* On an ink ground plum is too close to the background — the
                  primary action takes the warm neutral, with coral reserved for
                  the thread and the hover accent. */}
              <Link
                ref={magnetic}
                href={primaryUrl || "#courses"}
                className="rounded-full bg-sand px-7 py-3 font-medium text-ink-deep transition-colors hover:bg-white"
              >
                {primaryLabel || "ابدأ رحلتك"}
              </Link>
              <Link
                href={secondaryUrl || "/نبذة"}
                className="group relative rounded-full border border-white/20 px-6 py-3 font-medium text-white/90 transition-colors hover:border-white/40"
              >
                {secondaryLabel || "تعرّف على الأستاذ علي"}
              </Link>
            </div>

            {topStats.length > 0 && (
              <ul data-hero-rise className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
                {topStats.map((s, i) => {
                  const Icon = STAT_ICONS[i % STAT_ICONS.length];
                  return (
                    <li key={s.id} className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-coral">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-xl font-extrabold tabular-nums text-white">
                          {s.value}
                        </span>
                        <span className="block text-xs text-white/50">{s.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Visual column */}
          <div data-hero-visual className="relative">
            {imageUrl ? (
              // The CMS images are transparent CUTOUTS — the live hero asset is
              // 24.5% alpha-zero with all four corners transparent. So: no
              // frame, no crop, `object-contain`, and a soft halo behind it.
              // `object-cover` inside a rounded box (which this briefly had)
              // crops a cutout's empty margins and puts a visible edge around a
              // subject that is meant to float.
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-none">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 top-6 -z-10 rounded-[100%] blur-3xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, color-mix(in oklab, var(--color-aubergine) 85%, transparent), transparent 75%)",
                  }}
                />
                <Image
                  src={imageUrl}
                  alt="الأستاذ علي العباد"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 460px"
                  className="object-contain object-bottom"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
