import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { AiOrbit } from "@/components/motion/ai-orbit";
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
    <Section bg="background">
      <Reveal>
        <div className="shimmer-night relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:px-12 md:py-20">
          <AiOrbit className="pointer-events-none absolute -bottom-12 -start-10 size-56 text-white/15" />
          <AiOrbit className="pointer-events-none absolute -end-12 -top-14 size-48 text-white/10" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-violet">رؤيتنا</p>
            <p className="mx-auto mt-5 max-w-3xl text-2xl font-medium leading-relaxed text-white md:text-3xl md:leading-relaxed">
              {text || FALLBACK}
            </p>
            {ctaLabel && (
              <Link
                href={ctaUrl || "/الدورات"}
                className={cn(
                  buttonClasses("primary", "md"),
                  "mt-9 rounded-full bg-surface-strong text-ink hover:bg-lilac/90",
                )}
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
