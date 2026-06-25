import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import type { CourseRow } from "@/lib/database.types";
import { Section, SectionHeading } from "./section";
import { CourseCard } from "./course-card";
import { CourseExplorer } from "./course-explorer";

export function CourseShowcase({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: string[];
}) {
  if (courses.length === 0) return null;

  const [featured, ...rest] = courses;

  return (
    <Section id="courses" bg="background">
      <SectionHeading
        eyebrow="الدورات"
        title="دوراتٌ تأخذ بيدك خطوة بخطوة"
        sub="محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم."
      />

      <div className="mt-12 space-y-10">
        <CourseCard course={featured} featured />
        {rest.length > 0 && <CourseExplorer courses={rest} categories={categories} />}
      </div>

      <div className="mt-12 text-center">
        <Link href="/الدورات" className={buttonClasses("outline", "md")}>
          عرض جميع الدورات
        </Link>
      </div>
    </Section>
  );
}
