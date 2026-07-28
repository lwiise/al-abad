import type { CourseRow } from "@/lib/database.types";

/**
 * ============================================================================
 * Homepage section 4 — قسم الدورات: card facts + the colour system
 * ============================================================================
 *
 * Two things live here: the per-course facts the cards state (track, duration,
 * lessons, level) and the card colour rotation. Both are data about the course,
 * not styling decisions made inside the card.
 */

// ---------------------------------------------------------------------------
// Card facts
// ---------------------------------------------------------------------------

export type CourseSlots = {
  /** Eyebrow — the track this course belongs to. Overridden by the CMS `category` field. */
  track: string;
  /** e.g. "٦ ساعات" */
  duration: string;
  /** e.g. "٢٤ درساً" */
  lessons: string;
  /** e.g. "مبتدئ" / "متقدّم" */
  level: string;
};

const EMPTY: CourseSlots = { track: "", duration: "", lessons: "", level: "" };

/**
 * ⚠️ TODO(client) — fill these in. They are deliberately EMPTY.
 *
 * A course card that does not say what is being bought (how long it is, how
 * many lessons, who it is for) is a conversion failure, so the card renders all
 * three slots on every course. Until the real figures arrive each one shows a
 * dash: obviously unfinished, and impossible to mistake for a fact.
 *
 * Nothing here is guessed. Durations, lesson counts and levels are commercial
 * claims on a real person's site — inventing "٦ ساعات · ٢٤ درساً · مبتدئ"
 * because it looks finished would be a liability, not a placeholder. The demo
 * `course_modules` rows are marked [تجريبي] in data/courses-content.json, so
 * they cannot be counted either.
 *
 * `track` is the fallback for the eyebrow only. Prefer setting التصنيف on each
 * course in /admin ← الدورات — that field already exists in the CMS and takes
 * precedence over anything written here.
 *
 * Keys are the real course slugs (supabase/seed.sql). Courses missing from this
 * map render empty slots, so nothing breaks when a course is added.
 */
export const COURSE_SLOTS: Record<string, CourseSlots> = {
  // الموجه الزواجي (flagship)
  "comprehensive-marriage-guide-in-8-parts": { track: "", duration: "", lessons: "", level: "" },
  // خصائص الموجه الزواجي
  "characteristics-of-the-marriage-guide": { track: "", duration: "", lessons: "", level: "" },
  // دورة التوافق الزواجي
  "marital-compatibility": { track: "", duration: "", lessons: "", level: "" },
  // الحب وأنماط التعلق
  "love-cycle-and-attachment-patterns": { track: "", duration: "", lessons: "", level: "" },
  // إدارة الانفعالات
  "emotion-management": { track: "", duration: "", lessons: "", level: "" },
};

export function slotsFor(course: CourseRow): CourseSlots {
  const slots = COURSE_SLOTS[course.slug] ?? EMPTY;
  return { ...slots, track: course.category?.trim() || slots.track };
}

/** Labels for the meta row. The value beside each is a slot, never a guess. */
export const META_LABELS = {
  duration: "المدة",
  lessons: "الدروس",
  level: "المستوى",
} as const;

/**
 * "1,000 ر.س" for SAR, otherwise "1,000 <currency>". Null when the course is
 * unpriced — the slot then collapses rather than showing a zero.
 *
 * NOTE ON SHOWING PRICE: prices come from the CMS (real, merged from the old
 * site), and the card shows one whenever the course has one. Hiding price on a
 * course catalogue reliably costs conversions — visitors read a missing price
 * as "expensive" or as a sales call, and bounce rather than click through to
 * find out. Only hide it deliberately, e.g. while a promo re-price is mid-flight
 * or if the course moves to application-only enrolment; if so, clear `price` in
 * /admin rather than editing this component, so the two stay in sync.
 *
 * Mirrors the helper in components/sections/course-card.tsx — that copy belongs
 * to the /الدورات listing card, which this section does not touch.
 */
export function formatPrice(course: CourseRow): string | null {
  if (course.price == null) return null;
  const currency = course.currency ?? "SAR";
  const amount = Number(course.price).toLocaleString("en-US");
  return currency === "SAR" ? `${amount} ر.س` : `${amount} ${currency}`;
}

// ---------------------------------------------------------------------------
// Colour system
// ---------------------------------------------------------------------------

/**
 * Colour is a signal here, not decoration.
 *
 * TEAL APPEARS EXACTLY ONCE — on the flagship. One colour used one time reads
 * as meaning: teal = the comprehensive course. The other four rotate through
 * the brand purple, ink and accent tokens, so the block is one family with one
 * exception rather than five unrelated colours.
 *
 * The accent card is a DARKENED accent, not `--color-accent` itself. Measured
 * against the real tokens (WCAG 2.1, sRGB):
 *
 *   white on #e04f64 (accent)          → 3.84:1  ✗ fails AA for body text
 *   ink   on #e04f64                   → 3.08:1  ✗ worse
 *   white on the mix below (#9d3c4f)   → 6.57:1  ✓
 *   white/85 on the mix below          → 5.22:1  ✓  (eyebrow + meta row)
 *
 * The mix is derived from the two existing tokens rather than a new hex, so no
 * sixth hue enters the palette.
 */
export const CARD_SURFACES = {
  /** flagship only */
  teal: "var(--color-teal)",
  plum: "var(--color-primary)",
  ink: "var(--color-ink)",
  accent: "color-mix(in srgb, var(--color-accent) 66%, var(--color-ink-deep))",
} as const;

/**
 * The four non-flagship cards, in DOM order. In the RTL 2×2 grid that puts plum
 * top-leading, ink top-trailing, accent bottom-leading, plum bottom-trailing —
 * so the repeated plum sits on one diagonal and ink/accent on the other. The
 * accent is the loudest of the three and appears once.
 */
export const CARD_ROTATION = [
  CARD_SURFACES.plum,
  CARD_SURFACES.ink,
  CARD_SURFACES.accent,
  CARD_SURFACES.plum,
] as const;
