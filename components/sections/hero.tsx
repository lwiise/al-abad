"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMagnetic } from "@/components/motion/use-magnetic";
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
      {/* A single warm light source from the upper right — the whole lighting
          idea of the art direction in one gradient. Deliberately not a
          full-bleed violet wash. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 82% 12%, color-mix(in oklab, var(--color-aubergine) 70%, transparent) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(38% 30% at 88% 6%, color-mix(in oklab, var(--color-coral) 22%, transparent) 0%, transparent 70%)",
        }}
      />

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
            ) : (
              <MashrabiyaLight />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Stand-in for the hero portrait until real photography of the coach exists.
 *
 * Deliberately architectural rather than figurative: the art direction forbids
 * generating a face or Gulf dress, and a flat placeholder block reads worse on
 * near-black than it does on white. A mashrabiya screen with light behind it is
 * the approved vocabulary, and drawn in code it costs nothing and ships now.
 *
 * Replace wholesale once a real portrait lands in the CMS.
 */
function MashrabiyaLight() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/10 lg:max-w-none"
    >
      {/* light source behind the screen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 22%, color-mix(in oklab, var(--color-coral) 32%, transparent) 0%, transparent 70%), linear-gradient(180deg, var(--color-aubergine) 0%, var(--color-ink-deep) 72%)",
        }}
      />
      {/* the screen itself — an eight-point geometric lattice */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 200 250" fill="none">
        <defs>
          <pattern id="mashrabiya" width="25" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M12.5 0 L25 12.5 L12.5 25 L0 12.5 Z M12.5 6 L19 12.5 L12.5 19 L6 12.5 Z"
              stroke="var(--color-sand)"
              strokeOpacity="0.22"
              strokeWidth="0.6"
              fill="none"
            />
            <path
              d="M0 0 L6 6 M25 0 L19 6 M0 25 L6 19 M25 25 L19 19"
              stroke="var(--color-sand)"
              strokeOpacity="0.14"
              strokeWidth="0.6"
            />
          </pattern>
          <linearGradient id="mashrabiya-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.9" />
            <stop offset="0.65" stopColor="white" stopOpacity="0.35" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="mashrabiya-mask">
            <rect width="200" height="250" fill="url(#mashrabiya-fade)" />
          </mask>
        </defs>
        <rect width="200" height="250" fill="url(#mashrabiya)" mask="url(#mashrabiya-mask)" />
      </svg>
      {/* settle the base into the section ground */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-deep to-transparent" />
    </div>
  );
}
