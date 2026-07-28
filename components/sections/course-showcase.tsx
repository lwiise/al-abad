import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { CourseRow } from "@/lib/database.types";
import { CARD_ROTATION } from "./courses/course-slots";
import { EnterOnView } from "./courses/enter-on-view";
import { FlagshipCard, ShowcaseCard } from "./courses/showcase-card";

/**
 * ============================================================================
 * Homepage section 4 — قسم الدورات
 * ============================================================================
 *
 * The section itself stays quiet: flat paper, no gradient, no decoration. The
 * cards carry all the colour, and five saturated blocks on a tinted or gradient
 * ground would turn the whole band into noise.
 *
 * Structure: the flagship full-width, the other four in a 2×2 grid beneath it
 * (one column under 1080px — never a horizontal scroller; these are the product
 * and users miss cards in scrollers), then the ghost view-all beneath.
 *
 * See ./courses/showcase-card.tsx for the card anatomy and contrast ratios,
 * ./courses/curriculum-arc.tsx for the circle/arc signature, and
 * ./courses/course-slots.ts for the colour rotation and the meta slots.
 */

/**
 * Entrance state for one card: 24px rise + fade, 500ms, the section's curve.
 * `EnterOnView` flips `data-enter` on these; everything else is CSS.
 *
 * `translate` rather than `transform` — that is the property Tailwind v4 emits
 * for translate utilities, and transitioning the wrong one makes the rise snap.
 * Reduced motion resolves instantly, belt and braces with the observer, which
 * never hides anything in that case.
 *
 * Defined here, not in the client module beside the observer: a plain value
 * exported from a "use client" file arrives in a Server Component as a client
 * reference — an object, which cn()/clsx quietly drops.
 */
const ENTER_ITEM = [
  "data-[enter=hidden]:translate-y-6 data-[enter=hidden]:opacity-0",
  "transition-[opacity,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
  "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
].join(" ");

export function CourseShowcase({
  courses,
  eyebrow,
  heading,
  subhead,
  viewAllLabel,
  instructorImageUrl,
}: {
  courses: CourseRow[];
  eyebrow?: string | null;
  heading?: string | null;
  subhead?: string | null;
  viewAllLabel?: string | null;
  instructorImageUrl?: string | null;
}) {
  if (courses.length === 0) return null;

  const [featured, ...rest] = courses;
  const grid = rest.slice(0, 4); // flagship + 4 = the five shown on the homepage

  return (
    <section id="courses" className="bg-paper py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Same copy and type scale as every other section heading. The eyebrow
            is plum rather than the shared component's teal — teal is spent on
            the flagship and nowhere else in this section. */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">{eyebrow || "الدورات"}</p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            {heading || "دوراتٌ تأخذ بيدك خطوة بخطوة"}
          </h2>
          <span
            className="mx-auto mt-5 block h-1 w-12 rounded-full bg-primary/30"
            aria-hidden="true"
          />
          <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
            {subhead || "محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم."}
          </p>
        </div>

        <EnterOnView className="mt-12 flex flex-col gap-6">
          <div data-enter-item className={ENTER_ITEM}>
            <FlagshipCard course={featured} imageUrl={instructorImageUrl || "/coach.png"} />
          </div>

          {grid.length > 0 && (
            <ul className="grid gap-6 min-[1080px]:grid-cols-2">
              {grid.map((course, i) => (
                <li key={course.id} data-enter-item className={cn(ENTER_ITEM, "flex")}>
                  <ShowcaseCard
                    course={course}
                    quadrant={(i % 4) as 0 | 1 | 2 | 3}
                    surface={CARD_ROTATION[i % CARD_ROTATION.length]}
                  />
                </li>
              ))}
            </ul>
          )}
        </EnterOnView>

        <div className="mt-12 text-center">
          <Link
            href="/الدورات"
            className={cn(buttonClasses("ghost", "md"), "rounded-full border border-border-strong px-6 py-3")}
          >
            {viewAllLabel || "عرض جميع الدورات"}
          </Link>
        </div>
      </div>
    </section>
  );
}
