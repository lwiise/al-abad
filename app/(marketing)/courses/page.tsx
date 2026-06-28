import type { Metadata } from "next";
import { getCourseCategories, getPublishedCourses, getSettings } from "@/lib/data";
import { CourseCard } from "@/components/sections/course-card";
import { CourseExplorer } from "@/components/sections/course-explorer";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "الدورات",
  description: "دورات عملية في الوعي الزواجي والأسري مع الأستاذ علي العباد.",
};

export default async function CoursesPage() {
  const [courses, categories, settings] = await Promise.all([
    getPublishedCourses(),
    getCourseCategories(),
    getSettings(),
  ]);
  const [featured, ...rest] = courses;

  // Framing copy is editable from /admin/settings (shared with the homepage
  // courses section) — fall back to the page's own defaults.
  const eyebrow = settings?.courses_eyebrow || "الدورات";
  const heading = settings?.courses_heading || "دوراتنا";
  const subhead =
    settings?.courses_subhead ||
    "محتوى عمليّ يأخذ بيدك خطوة بخطوة — اختر ما يناسب وضعك وابدأ رحلتك.";

  return (
    <div>
      {/* Masthead — a soft lilac aura sets the tone before the first card. */}
      <header className="relative isolate overflow-hidden">
        <div className="aura absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-6 pb-6 pt-16 text-center md:pt-20">
          <Reveal>
            <p className="mb-3 text-sm font-medium text-secondary">{eyebrow}</p>
            <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">{heading}</h1>
            <span
              className="mx-auto mt-5 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
              aria-hidden="true"
            />
            <p className="mt-5 text-lg leading-relaxed text-foreground-muted">{subhead}</p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-6 md:pb-24">
        {courses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-foreground-muted">
            لا توجد دورات منشورة حالياً.
          </p>
        ) : (
          <div className="space-y-12">
            {featured && (
              <Reveal>
                <CourseCard course={featured} featured />
              </Reveal>
            )}
            {rest.length > 0 && <CourseExplorer courses={rest} categories={categories} />}
          </div>
        )}
      </div>
    </div>
  );
}
