import Link from "next/link";
import { Section } from "./section";

const FALLBACK =
  "تدريب وإعداد 100 ألف موجه زواجي محترف بطريقة عملية ومهنية بهدف نشر الوعي الزواجي والأسري وتطوير مجتمع واعٍ وسعيد يتجاوز كل المشاكل الأسرية والزواجية والنفسية";

export function Vision({
  text,
  ctaLabel,
  ctaUrl,
}: {
  text?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}) {
  return (
    <Section bg="ink" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-violet">رؤيتنا</p>
        <p className="mt-5 text-2xl font-medium leading-relaxed text-white md:text-3xl md:leading-relaxed">
          {text || FALLBACK}
        </p>
        {ctaLabel && (
          <Link
            href={ctaUrl || "/الدورات"}
            className="mt-9 inline-flex items-center justify-center rounded-lg bg-surface-strong px-6 py-3 font-medium text-ink transition-colors hover:bg-lilac/90"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </Section>
  );
}
