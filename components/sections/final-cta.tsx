import { WhatsappGlyph } from "@/components/site/icons";
import { Reveal } from "@/components/motion/reveal";
import { AiOrbit } from "@/components/motion/ai-orbit";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { Section } from "./section";

export function FinalCta({
  heading,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  waHref,
}: {
  heading?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  waHref?: string | null;
}) {
  return (
    <Section bg="background">
      <Reveal>
        <div className="shimmer-brand relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:py-20">
          <AiOrbit className="pointer-events-none absolute -start-12 -top-14 size-56 text-white/15" />
          <AiOrbit className="pointer-events-none absolute -bottom-14 -end-10 size-48 text-white/10" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white md:text-4xl">
              {heading || "ابدأ رحلتك نحو علاقةٍ أفضل اليوم"}
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticLink
                href={primaryUrl || "/الدورات"}
                className="rounded-full bg-accent px-7 py-3 font-medium text-on-accent shadow-lg transition-colors hover:bg-accent-hover"
              >
                {primaryLabel || "تصفح الدورات"}
              </MagneticLink>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <WhatsappGlyph className="size-5" />
                  {secondaryLabel || "تحدث معنا على واتساب"}
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
