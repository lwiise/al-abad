import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { StatRow } from "@/lib/database.types";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroBackdrop } from "./art/hero-backdrop";

const DEFAULT_HEADLINE = "زواج أكثر وعياً… وعلاقة تدوم";
const DEFAULT_SUBHEAD =
  "تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً متوازنةً وسعيدة.";

/**
 * The plate's oversized ground word.
 *
 * Decorative, and `aria-hidden` for it: the name is already the subject of the
 * h1 and the header's wordmark, so announcing it a third time is noise. Not CMS
 * copy — it is the brand mark, hardcoded in `header.tsx` for the same reason.
 */
const WORDMARK = "علي العباد";

/** Label over the stats card. */
const STATS_TITLE = "بالأرقام";

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
 * Section 1 — a dark plate floating on the light ground, nav above it.
 *
 * The nav is fixed and therefore out of flow, so this section starts at y=0 and
 * the GROUND runs behind it. The negative margin cancels the nav clearance the
 * marketing layout puts on <main>; the matching padding pushes the CONTENT back
 * below the nav. The plate begins below that, so the header keeps its
 * dark-on-light text and its frost-on-scroll behaviour untouched.
 *
 * Three layers inside the plate, back to front: the oversized ground word, the
 * headline, the portrait. The portrait occludes the ground word — which is
 * decorative and can be broken freely — and never the headline. Arabic is
 * cursive: a figure across the middle of a word destroys the word, so real text
 * stays clear of the figure and only the decorative layer takes the occlusion.
 *
 * Still a server component — the entrance is CSS keyframes, not JS, so there is
 * no client bundle and nothing to hydrate above the fold. The only interactive
 * piece in section 1 remains the nav's observer.
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
    <section className="relative isolate -mt-[var(--nav-h)] flex min-h-svh flex-col overflow-hidden pt-[var(--nav-h)]">
      <HeroBackdrop className="-z-10" />

      {/* The plate's margin. The ground shows through here — that is what the
          inset is for, and it is where the glow escapes to. */}
      <div className="relative mx-auto flex w-full max-w-[104rem] flex-1 flex-col px-3 pb-5 pt-3 sm:px-5 sm:pb-7 xl:px-8 xl:pb-10 xl:pt-4">
        {/* Glow, on the END side — the same side as the stats card, as in the
            reference. It sits OUTSIDE the plate so the plate's own
            overflow-hidden cannot clip it, and before the plate in DOM order so
            it paints above the backdrop and below the plate with no z-index
            needed: both are positioned, both are z-auto, so document order
            decides. Violet is legal here precisely because it is light and not
            text — on ink it measures 2.92:1 and could never be either. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(38% 46% at 9% 92%, color-mix(in oklab, var(--color-violet) 46%, transparent) 0%, transparent 72%)",
          }}
        />

        <div className="hero-plate relative isolate flex flex-1 flex-col overflow-hidden rounded-2xl">
          {/* Relief, START corner — the ground below carries the same tile at
              the opposite one. */}
          <div aria-hidden="true" className="hero-plate-najdi pointer-events-none absolute inset-0" />

          {/* --- Ground word -------------------------------------------------
              Clipped HORIZONTALLY by the plate's overflow, which is the effect
              we want, and never vertically: the final ي of علي descends well
              below the baseline, and commits 55ac189 / 6a3c0c1 are the record
              of what giant Arabic does when it is clipped or left to inherit a
              bundled line-height. Hence the explicit leading and padding. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[7%] select-none whitespace-nowrap text-center font-display font-bold text-white/14"
            style={{ fontSize: "clamp(3.25rem,17vw,15rem)", lineHeight: 1, paddingBottom: "0.2em" }}
          >
            {WORDMARK}
          </span>

          {/* --- Headline ----------------------------------------------------
              Lead above, calligraphic tail below — the natural reading order,
              which the lead's own ellipsis already sets up. The tail is LILAC,
              not the reference's violet: this is real text inside the h1, and
              violet on a dark ground is 2.92:1. Lilac is 11.96:1 on this plate
              and reads as the same accent. */}
          <div className="relative z-20 px-5 pt-[clamp(1.25rem,5vh,4rem)] text-center">
            {/* No `ch` cap here, and that is deliberate: `ch` resolves against
                the element's OWN font-size, and the h1 inherits 1rem while its
                children are set in clamp()s up to 4.5rem. A 26ch cap measured
                against 16px is ~220px, which wrapped the calligraphic line onto
                a second row and dropped it straight behind the portrait's head
                — the one thing the layering is built to prevent. Cap in rem. */}
            <h1 className="mx-auto max-w-5xl text-white">
              <span
                className="hero-enter block"
                // Height-aware, not just width-aware. On a wide-but-short window
                // a purely vw-based size grows the headline exactly where there
                // is least room for it, which squeezed the portrait and left the
                // Ruqʿah descenders ~5px off the ghutra. min() lets whichever
                // axis is scarcer win.
                style={{ ...enter(90), fontSize: "clamp(1.2rem,min(2.8vw,4vh),2.25rem)" }}
              >
                {lead}
              </span>
              {calligraphic && (
                <span
                  className="hero-enter mt-1 block font-calligraphy text-lilac"
                  // Ruqʿah sits far outside the em box — its descenders and
                  // sweeping baseline need this leading and the padding, or the
                  // top line clips against the block above.
                  style={{
                    ...enter(150),
                    fontSize: "clamp(2rem,min(6vw,8.5vh),4.5rem)",
                    lineHeight: 1.72,
                    paddingBottom: "0.14em",
                  }}
                >
                  {calligraphic}
                </span>
              )}
            </h1>
          </div>

          {/* --- Portrait ----------------------------------------------------
              In flow while the layout is stacked; above 1280px it becomes an
              absolutely positioned square anchored to the plate's bottom edge,
              with the two blocks flanking it.

              aspect-square, NOT aspect-[4/5]: coach.png is 1779x1736 —
              effectively square — so a square box matches it exactly and
              object-contain has nothing to letterbox. The old 4/5 box is why
              the figure rendered smaller than the column holding it. Same
              lesson as meet-instructor.tsx.

              Sized by BOTH the plate's height and 44vw, which is what stops a
              tall narrow window growing the square until it collides with the
              flanking blocks. Whichever binds first wins; the aspect matches
              the asset either way, so there is never dead space inside the box.

              The headline zone is `max(26%, 14rem)` and the absolute floor is
              the load-bearing half. A percentage alone fails on short windows:
              the headline's own height stops shrinking (its clamps bottom out)
              while 26% of the plate keeps falling, so at 1440x700 and 1280x800
              the ghutra ran into the Ruqʿah descenders. Measured, not guessed —
              the cutout's first opaque row is at 7.32% of its height, so the
              head starts far higher inside the box than the visual centre of
              mass suggests.

              1280px, not the repo's usual 1080px, for the flanking layout: at
              1080 the blocks land on the figure's arms rather than beside
              them. */}
          <div
            className="hero-enter relative z-10 mt-6 w-full px-5 xl:absolute xl:inset-x-0 xl:bottom-0 xl:top-[max(26%,14rem)] xl:mt-0 xl:flex xl:items-end xl:justify-center xl:px-0"
            style={enter(180)}
          >
            {/* The lg step matters: between 1024 and 1280 the layout is still
                stacked, and a 22rem cap there would render the figure SMALLER
                than the old 4/5 box did. */}
            <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[22rem] lg:max-w-[27rem] xl:mx-0 xl:h-full xl:w-auto xl:max-w-[44vw]">
              {/* One pool for the figure to stand in front of, the same device
                  as meet-instructor's, tuned for this ground. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[-18%] top-[-6%] -z-10 h-[76%]"
                style={{
                  background:
                    "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, var(--color-primary) 56%, transparent) 0%, transparent 72%)",
                }}
              />
              {/* Contact shadow, darker than the light-ground version it
                  replaces: on neutral-900 a #3a363d smudge is invisible. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[20%] bottom-[8%] -z-10 h-[5%] rounded-[100%] blur-xl"
                style={{ background: "rgb(8 5 12 / 0.75)" }}
              />
              {/* Falls back to /coach.png, as meet-instructor, course-hero and
                  course-pitch all already do. hero_image_url is never seeded,
                  so until this the homepage hero rendered no portrait at all.

                  The mask is verbatim from meet-instructor.tsx: the asset's
                  bottom ~10% is a patterned tablecloth he is sitting behind,
                  which reads as a foreign blue slab against the plate. This
                  removes it deterministically and dissolves the figure into
                  the plate instead of hard-cutting it. */}
              <Image
                src={imageUrl || "/coach.png"}
                alt="الأستاذ علي العباد"
                fill
                priority
                sizes="(max-width: 1280px) 88vw, 44vw"
                className="object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_0,transparent_4%,black_14%)]"
              />
            </div>
          </div>

          {/* --- The two blocks ----------------------------------------------
              START (the right in RTL) carries the eyebrow, the lede and the
              actions; END (the left) carries the stats. That is the mirror of
              the reference, which puts its paragraph at the bottom-start and
              its card at the bottom-end.

              Capped at 23rem — enough for the two CTAs to sit on one row, and
              measured against the figure rather than guessed. The cutout's
              transparent side margin is thinner than it looks: at the depth
              where the blocks sit, the body spans 5.6% to 94.6% of the square,
              so the slack before a block lands on his arm is smaller than the
              box implies. At 23rem the tightest case still clears by ~100px. */}
          <div className="relative z-20 mt-auto flex flex-col items-center gap-7 px-5 pb-[clamp(1.75rem,4vh,3rem)] pt-8 xl:flex-row xl:items-end xl:justify-between xl:gap-10 xl:px-10">
            <div
              className="hero-enter max-w-[23rem] text-center xl:text-start"
              style={enter(270)}
            >
              {/* Coral is the DOT, not the label. It is a fill colour: at
                  3.88:1 on this plate it clears the 3:1 graphics threshold and
                  fails the 4.5:1 text one. The label is lilac. */}
              <p className="inline-flex items-center gap-2 text-sm text-lilac">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {trustBadge || "موثوق من آلاف المتدربين"}
              </p>

              <p className="mt-3 text-base leading-relaxed text-neutral-300">
                {subhead || DEFAULT_SUBHEAD}
              </p>

              {/* buttonClasses(…, light) rather than hand-rolled pills — this
                  section was the last one still writing its own dark CTA, and
                  CLAUDE.md's rule exists because three of them had drifted.
                  There is no `lg` size, so the larger padding is added on top,
                  the way header.tsx adds rounded-full.

                  Deliberately not coral: FinalCta holds the page's one coral
                  CTA, and the dark-ground primary is lilac. */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 xl:justify-start">
                <Link
                  href={primaryUrl || "#courses"}
                  className={cn(buttonClasses("primary", "md", true), "rounded-full px-7 py-3")}
                >
                  {primaryLabel || "ابدأ رحلتك"}
                </Link>
                <Link
                  href={secondaryUrl || "/نبذة"}
                  className={cn(buttonClasses("outline", "md", true), "rounded-full px-6 py-3")}
                >
                  {secondaryLabel || "تعرّف على الأستاذ علي"}
                </Link>
              </div>
            </div>

            {/* The three stats as ONE card, not three floating pills — the
                reference's single card in the corner. */}
            <div
              className="hero-enter w-full max-w-[19rem] rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md xl:w-auto xl:min-w-[15rem]"
              style={enter(360)}
            >
              <p className="text-xs font-medium text-lilac">{STATS_TITLE}</p>
              <ul className="mt-2">
                {pills.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-baseline justify-between gap-4 border-t border-white/10 py-2 first:border-t-0"
                  >
                    <span className="text-lg font-extrabold tabular-nums text-white">{s.value}</span>
                    <span className="text-xs text-neutral-300">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grain last, over everything inside the plate — without it the wide
              dark gradients band on 6-bit panels, which is most of them. */}
          <div aria-hidden="true" className="hero-grain pointer-events-none absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
