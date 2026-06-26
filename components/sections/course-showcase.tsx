import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { CourseRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Section, SectionHeading } from "./section";
import { CourseCard } from "./course-card";

export function CourseShowcase({ courses }: { courses: CourseRow[] }) {
  if (courses.length === 0) return null;

  const [featured, ...rest] = courses;
  const grid = rest.slice(0, 4); // featured + 4 = 5 shown on the homepage

  return (
    <Section id="courses" bg="background">
      <Reveal>
        <SectionHeading
          eyebrow="الدورات"
          title="دوراتٌ تأخذ بيدك خطوة بخطوة"
          sub="محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم."
        />
      </Reveal>

      <div className="mt-12 space-y-6">
        <Reveal>
          <CourseCard course={featured} index={0} featured />
        </Reveal>
        {grid.length > 0 && (
          <Stagger className="grid gap-6 sm:grid-cols-2">
            {grid.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i + 1} />
            ))}
          </Stagger>
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
