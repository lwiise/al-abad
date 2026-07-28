import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { StatRow } from "@/lib/database.types";
import { HeroBackdrop } from "./art/hero-backdrop";

const DEFAULT_HEADLINE = "زواج أكثر وعياً… وعلاقة تدوم";

/** Shown when the CMS has no stats. Editors still override these. */
const FALLBACK_STATS = [
  { value: "+١٥", label: "سنة خبرة" },
  { value: "آلاف", label: "متدرب ومتدربة" },
  { value: "+١٠٠ ألف", label: "ساعة تدريب" },
];

/**
 * Split the headline at the ellipsis so the tail can be set in Ruqʿah.
 *
 * The headline is CMS copy, so this cannot hard-code "وعلاقة تدوم" — an editor
 * may change it. No ellipsis means no second line and no calligraphy.
 */
function splitHeadline(value: string): { lead: string; calligraphic: string | null } {
  const i = value.indexOf("…");
  if (i === -1) return { lead: value, calligraphic: null };
  return { lead: value.slice(0, i + 1).trim(), calligraphic: value.slice(i + 1).trim() || null };
}

/** Entrance delay. One shared curve and duration; only the offset changes. */
const enter = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/**
 * Section 1 — nav and hero as one continuous surface.
 *
 * The nav is fixed and out of flow, so this section starts at y=0 and its
 * background runs behind it. The negative margin cancels the nav clearance
 * that the marketing layout puts on <main>; the matching padding then pushes
 * the CONTENT back below the nav. Net result: one surface, no seam at any
 * scroll position.
 *
 * A server component — the entrance is CSS keyframes, not JS, so there is no
 * client bundle and nothing to hydrate. The only interactive piece in section
 * 1 is the nav's observer.
 */
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
  const { lead, calligraphic } = splitHeadline(headline || DEFAULT_HEADLINE);
  const pills = stats.length
    ? stats.slice(0, 3).map((s) => ({ value: s.value, label: s.label }))
    : FALLBACK_STATS;

  return (
    <section
      className="relative isolate -mt-[var(--nav-h)] flex min-h-svh flex-col justify-center overflow-hidden pt-[var(--nav-h)]"
    >
      <HeroBackdrop className="-z-10" />

      <div className="mx-auto w-full max-w-6xl px-6 py-14 min-[1080px]:py-20">
        <div className="flex flex-col items-center gap-10 min-[1080px]:grid min-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_190px] min-[1080px]:items-center min-[1080px]:gap-8">
          {/* --- Copy (right column in RTL) ------------------------------- */}
          <div className="order-1 max-w-xl text-center min-[1080px]:text-start">
            <p
              className="hero-enter inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-1.5 text-sm text-foreground-muted backdrop-blur-sm"
              style={enter(0)}
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {trustBadge || "موثوق من آلاف المتدربين"}
            </p>

            <h1 className="mt-6 text-4xl font-extrabold text-foreground sm:text-5xl min-[1080px]:text-6xl">
              <span className="hero-enter block" style={enter(90)}>
                {lead}
              </span>
              {calligraphic && (
                <span
                  className="hero-enter mt-2 block font-calligraphy text-primary"
                  // Ruqʿah sits far outside the em box — its descenders and
                  // sweeping baseline need this leading and the padding, or the
                  // top line clips against the block above.
                  style={{ ...enter(90), lineHeight: 1.72, paddingBottom: "0.14em" }}
                >
                  {calligraphic}
                </span>
              )}
            </h1>

            <p
              className="hero-enter mt-5 text-lg leading-relaxed text-foreground-muted"
              style={enter(180)}
            >
              {subhead ||
                "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً متوازنةً وسعيدة."}
            </p>

            <div
              className="hero-enter mt-8 flex flex-wrap justify-center gap-3 min-[1080px]:justify-start"
              style={enter(270)}
            >
              <Link
                href={primaryUrl || "#courses"}
                className="rounded-full bg-primary px-7 py-3 font-medium text-on-primary transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_10px_24px_-8px_rgb(88_59_102_/_0.55)]"
              >
                {primaryLabel || "ابدأ رحلتك"}
              </Link>
              <Link
                href={secondaryUrl || "/نبذة"}
                className="rounded-full border border-border-strong px-6 py-3 font-medium text-foreground transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_24px_-10px_rgb(58_54_61_/_0.35)]"
              >
                {secondaryLabel || "تعرّف على الأستاذ علي"}
              </Link>
            </div>
          </div>

          {/* --- Portrait (centre column) ---------------------------------
              Two things stop the cutout floating: a drop-shadow that follows
              its alpha edge, and the blurred ellipse beneath it standing in for
              contact with a floor. */}
          <div
            className="hero-enter relative order-3 w-full max-w-[19rem] min-[1080px]:order-2 min-[1080px]:max-w-none"
            style={enter(180)}
          >
            {imageUrl && (
              <div className="relative aspect-[4/5] w-full">
                {/* Contact shadow. Guarded with the image — on its own it is a
                    dark smudge sitting under nothing. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[12%] bottom-[2%] h-[7%] rounded-[100%] blur-xl"
                  style={{ background: "rgb(58 54 61 / 0.34)" }}
                />
                <Image
                  src={imageUrl}
                  alt="الأستاذ علي العباد"
                  fill
                  priority
                  sizes="(max-width: 1080px) 76vw, 420px"
                  className="object-contain object-bottom"
                  style={{ filter: "drop-shadow(0 18px 26px rgb(58 54 61 / 0.22))" }}
                />
              </div>
            )}
          </div>

          {/* --- Stat pills (left column) --------------------------------- */}
          <ul
            className="hero-enter order-2 flex w-full flex-row flex-wrap justify-center gap-3 min-[1080px]:order-3 min-[1080px]:w-auto min-[1080px]:flex-col min-[1080px]:justify-start"
            style={enter(360)}
          >
            {pills.map((s) => (
              <li
                key={s.label}
                className="rounded-xl border border-white/70 bg-white/75 px-4 py-3 text-center shadow-sm backdrop-blur-md min-[1080px]:text-start"
              >
                <span className="block text-xl font-extrabold tabular-nums text-foreground">
                  {s.value}
                </span>
                <span className="mt-0.5 block text-xs text-foreground-subtle">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
