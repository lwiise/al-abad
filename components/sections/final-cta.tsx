import { WhatsappGlyph } from "@/components/site/icons";
import { Reveal } from "@/components/motion/reveal";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { Section } from "./section";
import { OrbitField } from "./art/orbit-field";
import { Grain } from "./art/grain";

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
    <Section bg="background" width="full" className="py-0">
      <Reveal>
        {/* Full-bleed close — the last thing on the page should feel like it
            owns the screen, not like another card in the stack. */}
        <div className="shimmer-brand relative overflow-hidden px-6 py-24 text-center md:py-32">
          {/* Counter-rotating orbit pairs at opposite corners — they frame the
              CTA and keep the panel alive without competing with the button,
              which stays the only coral thing on screen. */}
          <OrbitField tone="light" className="-start-12 -top-14 size-56 opacity-60" />
          <OrbitField tone="light" className="-bottom-14 -end-10 size-48 opacity-40" />
          <Grain opacity={0.06} />

          <div className="relative z-10 mx-auto max-w-4xl">
            <h2 className="mx-auto max-w-3xl text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {heading || "ابدأ رحلتك نحو علاقةٍ أفضل اليوم"}
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticLink
                href={primaryUrl || "/الدورات"}
                className="rounded-full bg-accent px-7 py-3 font-medium text-on-accent shadow-lg transition-transform duration-300 hover:scale-[1.03] hover:bg-accent-hover"
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
