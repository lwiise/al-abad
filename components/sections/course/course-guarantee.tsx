import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "../section";

/**
 * الضمان الذهبي — a confident, dedicated risk-reversal section on a dark band,
 * with the coach's photo and the course's guarantee text verbatim. Gold seal
 * accent for trust; brand tokens otherwise. Sits before the offer.
 */
export function CourseGuarantee({
  guaranteeText,
  imageUrl,
}: {
  guaranteeText: string | null;
  imageUrl: string;
}) {
  if (!guaranteeText) return null;

  return (
    <Section bg="ink">
      <Reveal>
        <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12">
          <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-amber-300/20 md:w-52">
            <Image
              src={imageUrl}
              alt="الأستاذ علي العباد"
              fill
              sizes="220px"
              className="object-contain object-bottom"
            />
          </div>

          <div className="text-center md:text-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-300/15 px-3.5 py-1.5 text-sm font-bold text-amber-300">
              <ShieldCheck className="size-4" aria-hidden="true" />
              الضمان الذهبي
            </span>
            <p className="mt-5 text-xl font-bold leading-relaxed text-white md:text-2xl">{guaranteeText}</p>
            <p className="mt-4 text-neutral-400">— الأستاذ علي العباد</p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
