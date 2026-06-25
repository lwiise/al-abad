import Link from "next/link";
import { WhatsappGlyph } from "@/components/site/icons";
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
    <Section bg="ink">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          {heading || "ابدأ رحلتك نحو علاقةٍ أفضل اليوم"}
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryUrl || "/الدورات"}
            className="rounded-lg bg-accent px-6 py-3 font-medium text-on-accent transition-colors hover:bg-accent-hover"
          >
            {primaryLabel || "تصفح الدورات"}
          </Link>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              <WhatsappGlyph className="size-5 text-[#25D366]" />
              {secondaryLabel || "تحدث معنا على واتساب"}
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
