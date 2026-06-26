import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCourseBySlug, getPublishedCourses } from "@/lib/data";
import { Markdown } from "@/components/ui/markdown";

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

  const price = course.price != null ? `${course.price} ${course.currency ?? "SAR"}` : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <Link
        href="/الدورات"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" /> كل الدورات
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface-strong">
            {course.hero_image_url ? (
              <Image
                src={course.hero_image_url}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-7xl font-extrabold text-primary/25">
                  {course.title.trim().charAt(0)}
                </span>
              </div>
            )}
          </div>

          {course.category && (
            <span className="mt-6 inline-block text-sm text-secondary">{course.category}</span>
          )}
          <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">{course.title}</h1>
          {course.subtitle && <p className="mt-3 text-lg text-foreground-muted">{course.subtitle}</p>}

          {course.description ? (
            <div className="mt-8">
              <Markdown>{course.description}</Markdown>
            </div>
          ) : (
            <p className="mt-8 text-foreground-muted">
              تفاصيل هذه الدورة قيد الإضافة. للتسجيل أو الاستفسار تواصل معنا.
            </p>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {price && <p className="text-3xl font-extrabold text-foreground">{price}</p>}
            <p className="mt-1 text-sm text-foreground-muted">وصولٌ كامل إلى محتوى الدورة.</p>

            {course.cta_url ? (
              <a
                href={course.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-hover"
              >
                اشترك الآن
              </a>
            ) : (
              <Link
                href="/تواصل"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-hover"
              >
                للتسجيل تواصل معنا
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
