import { Check } from "lucide-react";
import type { CourseRow } from "@/lib/database.types";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Section, SectionHeading } from "../section";

/**
 * The pitch: the course's narrative body (markdown) rendered as styled rich
 * text, then the outcomes as a scannable check-list under "ماذا ستتعلّم".
 */
export function CoursePitch({ course }: { course: CourseRow }) {
  const outcomes = course.outcomes ?? [];
  if (!course.description && outcomes.length === 0) return null;

  return (
    <Section bg="surface">
      {course.description && (
        <Reveal className="mx-auto max-w-3xl">
          <div className="leading-loose text-foreground-muted">
            <Markdown>{course.description}</Markdown>
          </div>
        </Reveal>
      )}

      {outcomes.length > 0 && (
        <div className="mx-auto mt-16 max-w-4xl">
          <SectionHeading align="center" eyebrow="نتائج الدورة" title="ماذا ستتعلّم؟" />
          <Stagger as="ul" className="mt-8 grid gap-4 sm:grid-cols-2">
            {outcomes.map((o) => (
              <li
                key={o}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                <span className="leading-relaxed text-foreground">{o}</span>
              </li>
            ))}
          </Stagger>
        </div>
      )}
    </Section>
  );
}
