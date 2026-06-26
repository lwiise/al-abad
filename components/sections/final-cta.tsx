import Link from "next/link";
import { WhatsappGlyph } from "@/components/site/icons";
import { Reveal } from "@/components/motion/reveal";
import { Ribbon } from "@/components/ui/ribbon";
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
        <div className="relative overflow-hidden rounded-[2rem] bg-surface-strong px-6 py-16 text-center md:py-20">
          <div className="pointer-events-none absolute inset-x-0 bottom-2 opacity-80">
            <Ribbon id="final" text="ابدأ اليوم" tone="violet" />
          </div>

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-ink md:text-4xl">
              {heading || "ابدأ رحلتك نحو علاقةٍ أفضل اليوم"}
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={primaryUrl || "/الدورات"}
                className="rounded-full bg-accent px-7 py-3 font-medium text-on-accent shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg"
              >
                {primaryLabel || "تصفح الدورات"}
              </Link>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <WhatsappGlyph className="size-5 text-[#25D366]" />
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
