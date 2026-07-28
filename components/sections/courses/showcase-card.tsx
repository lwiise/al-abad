import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { ArcLayer, CurriculumArc } from "./curriculum-arc";
import { CARD_SURFACES, META_LABELS, formatPrice, slotsFor, type CourseSlots } from "./course-slots";

/**
 * ============================================================================
 * Homepage section 4 — the course cards
 * ============================================================================
 *
 * ANATOMY (both variants): eyebrow → title → meta row → arrow + price. The whole
 * surface is a single <a>: one tab stop, one focus ring, nothing nested.
 *
 * THE CUTOUT APPEARS ON THE FLAGSHIP ONLY. The coach already carries the hero
 * and the نبذة section; repeating him on five more cards made seven appearances
 * on one page, and by the fifth he is texture rather than a person. Keeping him
 * on the flagship alone is what makes it flagship — the other four are distinct
 * because they are type and one arc, not because they are smaller.
 *
 * TEXT COLOUR. Every card is a dark ground, so titles, meta values and prices
 * are solid white (6.31:1 teal · 9.41 plum · 11.83 ink · 6.58 accent) and the
 * quieter lines — eyebrow, meta labels, chevron — are white/85 (5.04 · 7.33 ·
 * 9.05 · 5.23). Every one clears AA for body text. See ./course-slots.ts for
 * why the accent card is not raw `--color-accent`.
 *
 * FOCUS. The global ring is violet (#a551fc) which only reaches 1.5–2.9:1 on
 * these grounds, so the cards take a white ring INSET by 4px: it lands on the
 * card colour, never on the paper section behind it, and measures 6.31–11.83:1.
 */

/**
 * 320ms on the section's curve. The property is `translate`, not `transform`:
 * Tailwind v4 emits `-translate-y-1` as `translate: … …`, so transitioning
 * `transform` would have left the lift snapping instantly.
 */
const TRANSITION = "transition-[translate,border-color] duration-[320ms] ease-[cubic-bezier(.22,1,.36,1)]";

/** Shared card chrome. The lift is 4px; under reduced motion it becomes a border change only. */
const CARD_BASE = cn(
  "group relative isolate block overflow-hidden border border-white/0 shadow-md",
  "text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-white focus-visible:[outline-offset:-4px]",
  TRANSITION,
  "hover:-translate-y-1",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:border-white/45",
);

/**
 * Small and quiet, but NOT letter-spaced: Arabic never takes tracking — it
 * breaks letter joining, and globals.css nulls it globally. Size, weight and
 * tone carry the separation instead. `min-h-5` holds the line while the track
 * is still empty, so the five cards stay on one rhythm.
 */
const EYEBROW = "min-h-5 text-xs font-medium text-white/85";

export function FlagshipCard({
  course,
  imageUrl,
}: {
  course: CourseRow;
  /** The existing coach cutout PNG — same asset as the hero and نبذة. */
  imageUrl: string;
}) {
  const slots = slotsFor(course);

  return (
    <Link
      href={`/الدورات/${course.slug}`}
      style={{ backgroundColor: CARD_SURFACES.teal }}
      className={cn(
        CARD_BASE,
        "rounded-[2rem]",
        // Stacked on a phone: copy leads, cutout beneath it on the leading edge.
        "flex flex-col",
        // Side by side as soon as there is room — a stacked flagship at tablet
        // width leaves a dead area beside the copy. The min-height keeps it
        // noticeably taller than the 2×2 even on a short window, where the
        // cutout shrinks to its 34svh floor or drops out entirely.
        "md:grid md:min-h-80 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end",
      )}
    >
      {/* The closed circle, behind the cutout on the leading edge. It stays put
          when the cutout is dropped on short viewports, so the flagship still
          reads as the circle card. */}
      <ArcLayer className="inset-y-0 start-0 w-[45%]">
        <CurriculumArc id={`arc-${course.slug}`} />
      </ArcLayer>

      {/* Copy — trailing side on desktop, first in the stack on small screens. */}
      <div
        className={cn(
          "relative z-10 flex flex-col gap-5 p-8 max-[520px]:p-6",
          // w-fit + a cap: title, meta row and action row then share one
          // measure, instead of the action row stretching the full column
          // while the title sits short.
          "md:order-2 md:w-fit md:max-w-md md:self-center md:p-10 min-[1080px]:p-12",
        )}
      >
        <Eyebrow slots={slots} />
        <h3 className="text-2xl leading-[1.3] text-white sm:text-3xl lg:text-4xl line-clamp-2">
          {course.title}
        </h3>
        <MetaRow slots={slots} />
        <ActionRow course={course} />
      </div>

      {/* Cutout — bottom-aligned on the leading edge. 34svh is the floor: below a
          600px-tall viewport that lands under ~204px, which reads as an accident
          rather than a portrait, so the cutout is dropped and the flagship runs
          as a type-and-arc card like the other four. */}
      <div
        className={cn(
          "relative z-10 h-[clamp(13rem,34svh,26rem)] w-full max-w-xs self-start",
          "md:order-1 md:max-w-none md:self-end",
          "[@media(max-height:600px)]:hidden",
        )}
      >
        <Image
          src={imageUrl}
          alt="الأستاذ علي العباد"
          fill
          sizes="(max-width: 1080px) 60vw, 420px"
          className="object-contain object-bottom"
        />
      </div>
    </Link>
  );
}

export function ShowcaseCard({
  course,
  quadrant,
  surface,
}: {
  course: CourseRow;
  /** Which 90° arc of the shared circle this card carries. */
  quadrant: 0 | 1 | 2 | 3;
  surface: string;
}) {
  const slots = slotsFor(course);

  return (
    <Link
      href={`/الدورات/${course.slug}`}
      style={{ backgroundColor: surface }}
      className={cn(
        CARD_BASE,
        "flex w-full min-h-60 flex-col justify-end gap-5 rounded-[1.5rem] p-8 max-[520px]:p-6 lg:min-h-68 lg:p-10",
      )}
    >
      <ArcLayer className="inset-0">
        <CurriculumArc id={`arc-${course.slug}`} quadrant={quadrant} />
      </ArcLayer>

      <div className="relative z-10 flex flex-col gap-5">
        <Eyebrow slots={slots} />
        <h3 className="text-2xl leading-[1.3] text-white lg:text-[1.75rem] line-clamp-2">
          {course.title}
        </h3>
        <MetaRow slots={slots} />
        <ActionRow course={course} />
      </div>
    </Link>
  );
}

/** Track label. Empty until التصنيف is set in /admin — the row keeps its height. */
function Eyebrow({ slots }: { slots: CourseSlots }) {
  return <p className={EYEBROW}>{slots.track}</p>;
}

/**
 * What is actually being bought. Three slots, always rendered, hairline
 * separators between them. An empty slot shows a dash — see COURSE_SLOTS.
 *
 * The label rides the row's white/85 and the value takes solid white: a label
 * dimmer than that measured 3.96:1 on the flagship teal and 4.08:1 on the
 * accent card, both under AA — and the fact matters more than the word for it
 * anyway. The separators are decorative (white/25); the gap alone already
 * separates the items.
 */
function MetaRow({ slots }: { slots: CourseSlots }) {
  const items = [
    { label: META_LABELS.duration, value: slots.duration },
    { label: META_LABELS.lessons, value: slots.lessons },
    { label: META_LABELS.level, value: slots.level },
  ];

  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85 max-[520px]:text-[0.7rem]">
      {items.map((item, i) => (
        <li
          key={item.label}
          className={cn(
            "flex items-center gap-1.5",
            i > 0 && "border-s border-white/25 ps-3",
          )}
        >
          <span>{item.label}</span>
          <span className="font-medium text-white">{item.value || "—"}</span>
        </li>
      ))}
    </ul>
  );
}

/** Leading-edge chevron + the price slot on the trailing edge. */
function ActionRow({ course }: { course: CourseRow }) {
  const price = formatPrice(course);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Points along the reading direction (RTL → leftwards) and travels 4px
          that way on hover. */}
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "size-5 shrink-0 text-white/85",
          "transition-[translate] duration-[320ms] ease-[cubic-bezier(.22,1,.36,1)]",
          "group-hover:-translate-x-1 group-focus-visible:-translate-x-1",
          "motion-reduce:transition-none motion-reduce:group-hover:translate-x-0",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      </svg>

      {price && <span className="text-sm font-semibold text-white">{price}</span>}
    </div>
  );
}
