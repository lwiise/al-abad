import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";

function Thumb({ course, className }: { course: CourseRow; className?: string }) {
  if (course.hero_image_url) {
    return (
      <Image
        src={course.hero_image_url}
        alt={course.title}
        fill
        sizes="(max-width: 768px) 100vw, 380px"
        className="object-cover"
      />
    );
  }
  // Branded fallback — lilac field + course initial. No generic stock imagery.
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-strong">
      <span className={cn("font-extrabold text-primary/25", className ?? "text-5xl")}>
        {course.title.trim().charAt(0)}
      </span>
    </div>
  );
}

function price(course: CourseRow): string | null {
  if (course.price == null) return null;
  return `${course.price} ${course.currency ?? "SAR"}`;
}

/** Plain component (no server-only deps) — usable in server pages and the client explorer. */
export function CourseCard({ course, featured = false }: { course: CourseRow; featured?: boolean }) {
  const href = `/الدورات/${course.slug}`;
  const p = price(course);

  if (featured) {
    return (
      <Link
        href={href}
        className="group grid overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-lg md:grid-cols-2"
      >
        <div className="relative aspect-video md:aspect-auto md:min-h-[18rem]">
          <Thumb course={course} className="text-7xl" />
          <span className="absolute end-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-on-primary">
            الأكثر شمولاً
          </span>
        </div>
        <div className="flex flex-col justify-center gap-3 p-8">
          {course.category && <span className="text-sm text-secondary">{course.category}</span>}
          <h3 className="text-2xl font-bold text-foreground">{course.title}</h3>
          {course.subtitle && (
            <p className="text-foreground-muted">{course.subtitle}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            {p ? <span className="text-lg font-bold text-primary">{p}</span> : <span />}
            <span className="inline-flex items-center gap-1.5 font-medium text-primary transition-transform group-hover:-translate-x-1">
              عرض التفاصيل <ArrowLeft className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video">
        <Thumb course={course} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {course.category && <span className="text-xs text-secondary">{course.category}</span>}
        <h3 className="font-bold text-foreground">{course.title}</h3>
        {course.subtitle && (
          <p className="line-clamp-2 text-sm text-foreground-muted">{course.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          {p ? <span className="font-bold text-primary">{p}</span> : <span />}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform group-hover:-translate-x-1">
            التفاصيل <ArrowLeft className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
