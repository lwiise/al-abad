import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseModules, getPublishedCourses } from "@/lib/data";
import { Markdown } from "@/components/ui/markdown";
import { CourseHero } from "@/components/sections/course/course-hero";

export const revalidate = 300;

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "الدورة غير موجودة" };
  return {
    title: course.title,
    description: course.subtitle ?? "دورة مع الأستاذ علي العباد.",
  };
}

export default async function CourseDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const modules = await getCourseModules(course.id);

  return (
    <>
      <CourseHero course={course} modules={modules} />

      {/* Remaining sections (pitch, curriculum, instructor, testimonials, offer,
          FAQ, final CTA) are built after the hero direction is approved. */}
      {course.description && (
        <section className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <Markdown>{course.description}</Markdown>
        </section>
      )}
    </>
  );
}
