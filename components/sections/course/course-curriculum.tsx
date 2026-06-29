"use client";

import { Layers, BookOpen, Clock, PlayCircle } from "lucide-react";
import type { CourseModuleRow } from "@/lib/database.types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CountUp } from "@/components/motion/count-up";
import { Section, SectionHeading } from "../section";

/** Minutes from a free-text duration like "45 دقيقة" / "ساعة" / "2 ساعة". */
function durMinutes(d: string | null): number {
  if (!d) return 0;
  let m = 0;
  const hr = d.match(/(\d+)?\s*ساعة/);
  const min = d.match(/(\d+)\s*دقيقة/);
  if (hr) m += (hr[1] ? parseInt(hr[1], 10) : 1) * 60;
  if (min) m += parseInt(min[1], 10);
  return m;
}

export function CourseCurriculum({ modules }: { modules: CourseModuleRow[] }) {
  if (modules.length === 0) return null;

  const totalLessons = modules.reduce((s, m) => s + (m.lessons ?? 0), 0);
  const totalMin = modules.reduce((s, m) => s + durMinutes(m.duration), 0);

  const stats = [
    { icon: Layers, value: modules.length, label: "محاور" },
    totalLessons ? { icon: BookOpen, value: totalLessons, label: "درساً" } : null,
    totalMin ? { icon: Clock, value: totalMin, label: "دقيقة" } : null,
  ].filter(Boolean) as { icon: typeof Layers; value: number; label: string }[];

  return (
    <Section bg="surface" id="curriculum">
      <SectionHeading
        align="center"
        eyebrow="المنهج"
        title="ماذا يتضمّن المحتوى؟"
        sub="محتوى عمليّ مقسّم إلى محاور تأخذك خطوةً بخطوة."
      />

      {/* stat badges */}
      <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
        {stats.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-secondary shadow-sm ring-1 ring-border">
              <s.icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-2xl font-extrabold tabular-nums text-foreground">
                <CountUp value={s.value} />
              </span>
              <span className="block text-xs text-foreground-subtle">{s.label}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-background px-5">
          {modules.map((m, i) => {
            const lessons = m.lessons ?? 0;
            return (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger>
                  <span className="flex flex-1 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold tabular-nums text-primary">
                      {i + 1}
                    </span>
                    <span className="text-start">{m.title}</span>
                    {(lessons > 0 || m.duration) && (
                      <span className="ms-auto hidden text-sm font-normal text-foreground-subtle sm:inline">
                        {[lessons ? `${lessons} دروس` : null, m.duration].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {lessons > 0 ? (
                    <ul className="space-y-1.5">
                      {Array.from({ length: lessons }).map((_, k) => (
                        <li key={k} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                          <PlayCircle className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                          <span className="text-foreground-muted">الدرس {k + 1}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>محتوى هذا المحور {m.duration ? `(${m.duration})` : ""}.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </Section>
  );
}
