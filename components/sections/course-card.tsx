"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { useTilt } from "@/components/motion/use-tilt";
import { MediaFallback } from "./media-fallback";

function price(course: CourseRow): string | null {
  if (course.price == null) return null;
  return `${course.price} ${course.currency ?? "SAR"}`;
}

/**
 * Image-led overlay card: photo (or brand-gradient fallback) with a bottom
 * scrim, title/benefit/price overlaid in white, a category pill (top-start)
 * and a circular arrow affordance (top-end). The whole card is the link.
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
  const p = price(course);
  const tilt = useTilt<HTMLAnchorElement>();

  return (
    <Link
      ref={tilt}
      href={href}
      className={cn(
        "group relative block aspect-video overflow-hidden rounded-3xl shadow-md transition-shadow duration-300 hover:shadow-xl",
      )}
    >
      <div className="absolute inset-0">
        {course.hero_image_url ? (
          <Image
            src={course.hero_image_url}
            alt={course.title}
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 760px" : "(max-width: 768px) 100vw, 380px"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MediaFallback title={course.title} seed={index} showTitle={false} />
        )}
      </div>

      {/* legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

      {/* top row */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        {course.category ? (
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
            {course.category}
          </span>
        ) : (
          <span />
        )}
        <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-ink transition-transform duration-300 group-hover:-rotate-12">
          <ArrowUpLeft className="size-4" />
        </span>
      </div>

      {/* bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className={cn("font-bold leading-snug", featured ? "text-2xl md:text-3xl" : "text-lg")}>
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="mt-1.5 line-clamp-2 max-w-md text-sm text-white/85">{course.subtitle}</p>
        )}
        {p && (
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
            {p}
          </span>
        )}
      </div>
    </Link>
  );
}
