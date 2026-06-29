import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  asList,
  getCourseBySlug,
  getCourseModules,
  getPublishedCourses,
  getPublishedFaqs,
  getPublishedTestimonials,
  getSettings,
} from "@/lib/data";
import { MeetInstructor } from "@/components/sections/meet-instructor";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { CourseHero } from "@/components/sections/course/course-hero";
import { StickyBuyBar } from "@/components/sections/course/sticky-buy-bar";
import { CoursePitch } from "@/components/sections/course/course-pitch";
import { CourseCurriculum } from "@/components/sections/course/course-curriculum";
import { CourseOffer } from "@/components/sections/course/course-offer";
import { CourseFinalCta } from "@/components/sections/course/course-final-cta";
import { formatPrice, priceParts } from "@/components/sections/course/pricing";

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

  const [modules, testimonials, faqs, settings] = await Promise.all([
    getCourseModules(course.id),
    getPublishedTestimonials(),
    getPublishedFaqs(),
    getSettings(),
  ]);

  const { price, original, currency, hasAnchor } = priceParts(course);
  const priceLabel = price != null ? formatPrice(price, currency) : null;
  const originalLabel = hasAnchor && original != null ? formatPrice(original, currency) : null;

  return (
    <>
      <StickyBuyBar
        title={course.title}
        priceLabel={priceLabel}
        originalLabel={originalLabel}
        ctaUrl={course.cta_url}
      />

      <CourseHero course={course} modules={modules} />
      <CoursePitch course={course} />
      <CourseCurriculum modules={modules} />
      <MeetInstructor
        aboutBody={settings?.about_body}
        imageUrl={settings?.hero_image_url}
        eyebrow={settings?.instructor_eyebrow}
        name={settings?.instructor_name}
        markers={asList(settings?.instructor_markers)}
        ctaLabel={settings?.instructor_cta_label}
      />
      <Testimonials testimonials={testimonials} />
      <CourseOffer course={course} modules={modules} />
      <Faq faqs={faqs} />
      <CourseFinalCta course={course} />
    </>
  );
}
