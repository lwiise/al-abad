"use client";

import type { CourseModuleRow } from "@/lib/database.types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "../section";

/** Curriculum as an accordion: one expandable row per module. */
export function CourseCurriculum({ modules }: { modules: CourseModuleRow[] }) {
  if (modules.length === 0) return null;

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons ?? 0), 0);

  return (
    <Section bg="background" id="curriculum">
      <SectionHeading
        align="center"
        eyebrow="المنهج"
        title="ماذا يتضمّن المحتوى؟"
        sub={`${modules.length} محاور${totalLessons ? ` · ${totalLessons} درساً` : ""} من الشرح العملي خطوةً بخطوة.`}
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion
          type="single"
          collapsible
          className="rounded-2xl border border-border bg-surface px-5"
        >
          {modules.map((m, i) => {
            const meta = [m.lessons ? `${m.lessons} دروس` : null, m.duration]
              .filter(Boolean)
              .join(" · ");
            return (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger>
                  <span className="flex flex-1 items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-start">{m.title}</span>
                    {meta && (
                      <span className="ms-auto hidden text-sm font-normal text-foreground-subtle sm:inline">
                        {meta}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    {`يأخذك هذا المحور خطوةً بخطوة عبر «${m.title}»`}
                    {meta ? ` (${meta})` : ""}
                    {" بأسلوبٍ مبسّط وتطبيقٍ عملي."}
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </Section>
  );
}
