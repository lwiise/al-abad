import { Check, ShieldCheck } from "lucide-react";
import type { CourseRow, CourseModuleRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { Section } from "../section";
import { formatPrice, priceParts } from "./pricing";

/** The offer: one focused dark card — price anchor, value stack, guarantee, CTA. */
export function CourseOffer({
  course,
  modules,
}: {
  course: CourseRow;
  modules: CourseModuleRow[];
}) {
  const { price, original, currency, hasAnchor, discountPct } = priceParts(course);
  const priceLabel = price != null ? formatPrice(price, currency) : null;
  const originalLabel = hasAnchor && original != null ? formatPrice(original, currency) : null;

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons ?? 0), 0);
  const includes = [
    "وصولٌ كامل ومدى الحياة لمحتوى الدورة",
    modules.length
      ? `${modules.length} محاور${totalLessons ? ` تضمّ ${totalLessons} درساً` : ""}`
      : null,
    course.guarantee_text ? "ضمان استرجاع المبلغ كما في الضمان الذهبي" : null,
  ].filter(Boolean) as string[];

  return (
    <Section bg="lilac" id="course-offer">
      <Reveal className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-8 text-center text-white shadow-xl md:p-10">
          <p className="text-sm font-medium text-violet">العرض الحالي</p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">سجّل في الدورة الآن</h2>

          {priceLabel && (
            <div className="mt-6 flex items-end justify-center gap-3">
              <span className="text-5xl font-extrabold">{priceLabel}</span>
              {originalLabel && (
                <span className="flex flex-col items-start gap-1 pb-1">
                  <span className="text-lg text-neutral-400 line-through">{originalLabel}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">
                    وفّر {discountPct}%
                  </span>
                </span>
              )}
            </div>
          )}

          <ul className="mx-auto mt-8 max-w-md space-y-3 text-start">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-1 size-5 shrink-0 text-secondary" aria-hidden="true" />
                <span className="text-neutral-200">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <MagneticLink
              href={course.cta_url || "/تواصل"}
              target={course.cta_url ? "_blank" : undefined}
              rel={course.cta_url ? "noopener noreferrer" : undefined}
              className="inline-flex rounded-full bg-accent px-8 py-3.5 text-lg font-semibold text-on-accent shadow-lg transition-colors hover:bg-accent-hover"
            >
              {course.cta_url ? "اشترك الآن" : "للتسجيل تواصل معنا"}
            </MagneticLink>
          </div>

          {course.guarantee_text && (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-neutral-400">
              <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
              {course.guarantee_text}
            </p>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
