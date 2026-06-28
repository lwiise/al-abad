"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { CourseRow } from "@/lib/database.types";
import { useTilt } from "@/components/motion/use-tilt";
import { MediaFallback } from "./media-fallback";

/** "1,000 ر.س" for SAR, otherwise "1,000 <currency>". Null when the course is unpriced. */
function formatPrice(course: CourseRow): string | null {
  if (course.price == null) return null;
  const currency = course.currency ?? "SAR";
  const amount = Number(course.price).toLocaleString("en-US");
  return currency === "SAR" ? `${amount} ر.س` : `${amount} ${currency}`;
}

/**
 * Course cards lead with the cover artwork — the title and branding are baked
 * into the graphic, so the card overlays nothing but the price. Hover gently
 * zooms the image; on desktop the whole card gets a 3D tilt + lift via useTilt
 * (which drives the transform, so we never transition transform in CSS here).
 *
 * The `featured` variant is a larger banner that also carries an enrol CTA, so
 * it uses a stretched link rather than a wrapping <a> (the CTA must be its own
 * link, and <a> cannot nest inside <a>).
 */
export function CourseCard({
  course,
  index = 0,
  featured = false,
}: {
  course: CourseRow;
  index?: number;
  featured?: boolean;
}) {
  const href = `/الدورات/${course.slug}`;
  const price = formatPrice(course);

  return featured ? (
    <FeaturedCard course={course} href={href} price={price} index={index} />
  ) : (
    <GridCard course={course} href={href} price={price} index={index} />
  );
}

function GridCard({
  course,
  href,
  price,
  index,
}: {
  course: CourseRow;
  href: string;
  price: string | null;
  index: number;
}) {
  const tilt = useTilt<HTMLAnchorElement>();

  return (
    <Link
      ref={tilt}
      href={href}
      className="group relative block aspect-video overflow-hidden rounded-3xl border border-border bg-surface-strong shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {course.hero_image_url ? (
        <Image
          src={course.hero_image_url}
          alt={course.title}
          fill
          quality={90}
          // Grid is sm:grid-cols-2 inside a max-w-6xl (1104px) section → each card
          // renders up to ~540px; under-declaring made the browser upscale → soft.
          sizes="(max-width: 640px) 100vw, (max-width: 1152px) 50vw, 540px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <MediaFallback title={course.title} seed={index} className="absolute inset-0" />
      )}

      {price && (
        <span className="absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink shadow-sm backdrop-blur">
          {price}
        </span>
      )}
    </Link>
  );
}

function FeaturedCard({
  course,
  href,
  price,
  index,
}: {
  course: CourseRow;
  href: string;
  price: string | null;
  index: number;
}) {
  return (
    <div className="group relative aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-border bg-surface-strong shadow-lg transition-shadow duration-300 hover:shadow-xl md:aspect-[16/7]">
      {course.hero_image_url ? (
        <Image
          src={course.hero_image_url}
          alt={course.title}
          fill
          priority
          quality={90}
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <MediaFallback title={course.title} seed={index} className="absolute inset-0" />
      )}

      {/* gradient only behind the action row, so the price + CTA stay legible */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent"
        aria-hidden="true"
      />

      {/* whole-card link to the detail page — a sibling of the CTA, never its parent */}
      <Link href={href} aria-label={course.title} className="absolute inset-0 z-10" />

      {/* action row above the stretched link; only the CTA captures clicks, the
          rest falls through (pointer-events-none) so the card still opens detail */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 p-5 md:p-7">
        {price ? (
          <span className="text-2xl font-extrabold text-white drop-shadow-sm md:text-3xl">
            {price}
          </span>
        ) : (
          <span />
        )}

        {course.cta_url ? (
          <a
            href={course.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonClasses("danger", "md"), "pointer-events-auto rounded-full shadow-md")}
          >
            اشترك الآن
          </a>
        ) : (
          <Link
            href={href}
            className={cn(buttonClasses("danger", "md"), "pointer-events-auto rounded-full shadow-md")}
          >
            اعرف المزيد
          </Link>
        )}
      </div>
    </div>
  );
}
