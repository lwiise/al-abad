import { ShieldCheck } from "lucide-react";
import type { CourseRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { AiOrbit } from "@/components/motion/ai-orbit";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { Section } from "../section";
import { formatPrice, priceParts } from "./pricing";

/** Closing CTA: transformation recap + price + guarantee on the brand band. */
export function CourseFinalCta({ course }: { course: CourseRow }) {
  const { price, currency } = priceParts(course);
  const priceLabel = price != null ? formatPrice(price, currency) : null;

  return (
    <Section bg="background">
      <Reveal>
        <div className="shimmer-brand relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:py-20">
          <AiOrbit className="pointer-events-none absolute -start-12 -top-14 size-56 text-white/15" />
          <AiOrbit className="pointer-events-none absolute -bottom-14 -end-10 size-48 text-white/10" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white md:text-4xl">
              ابدأ رحلتك في «{course.title}» اليوم
            </h2>
            {priceLabel && (
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                انضمَّ الآن مقابل <span className="font-bold">{priceLabel}</span> فقط — بوصولٍ مدى
                الحياة إلى كامل المحتوى.
              </p>
            )}

            <div className="mt-8 flex justify-center">
              <MagneticLink
                href={course.cta_url || "/تواصل"}
                target={course.cta_url ? "_blank" : undefined}
                rel={course.cta_url ? "noopener noreferrer" : undefined}
                className="rounded-full bg-accent px-8 py-3.5 text-lg font-semibold text-on-accent shadow-lg transition-colors hover:bg-accent-hover"
              >
                {course.cta_url ? "اشترك الآن" : "للتسجيل تواصل معنا"}
              </MagneticLink>
            </div>

            {course.guarantee_text && (
              <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/80">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {course.guarantee_text}
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
