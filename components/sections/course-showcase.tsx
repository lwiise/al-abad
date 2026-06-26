import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { CourseRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
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
      <Reveal>
        <SectionHeading
          eyebrow="الدورات"
          title="دوراتٌ تأخذ بيدك خطوة بخطوة"
          sub="محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم."
        />
      </Reveal>

      <div className="mt-12 space-y-8">
        <Reveal>
          <CourseCard course={featured} index={0} featured />
        </Reveal>
        {rest.length > 0 && (
          <Reveal>
            <CourseExplorer courses={rest} categories={categories} />
          </Reveal>
        )}
      </div>

      <div className="mt-12 text-center">
        <Link href="/الدورات" className={cn(buttonClasses("outline", "md"), "rounded-full")}>
          عرض جميع الدورات
        </Link>
      </div>
    </Section>
  );
}
