import type { Metadata } from "next";
import { getCourseCategories, getPublishedCourses } from "@/lib/data";
import { CourseCard } from "@/components/sections/course-card";
import { CourseExplorer } from "@/components/sections/course-explorer";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "الدورات",
  description: "دورات عملية في الوعي الزواجي والأسري مع الأستاذ علي العباد.",
};

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCourseCategories(),
  ]);
  const [featured, ...rest] = courses;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">دوراتنا</h1>
        <p className="mt-4 text-lg text-foreground-muted">
          محتوى عمليّ يأخذ بيدك خطوة بخطوة — اختر ما يناسب وضعك وابدأ رحلتك.
        </p>
      </header>

      {courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-foreground-muted">
          لا توجد دورات منشورة حالياً.
        </p>
      ) : (
        <div className="space-y-10">
          {featured && <CourseCard course={featured} featured />}
          {rest.length > 0 && <CourseExplorer courses={rest} categories={categories} />}
        </div>
      )}
    </div>
  );
}
