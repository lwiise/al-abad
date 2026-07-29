import type { TestimonialRow } from "@/lib/database.types";
import { WhatsappGlyph } from "@/components/site/icons";
import { Sequence } from "@/components/motion/sequence";
import { MagneticLink } from "@/components/motion/magnetic-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { cn, splitAtEllipsis } from "@/lib/utils";
import { Section } from "./section";

const DEFAULT_EYEBROW = "لا تؤجّل البداية";
const DEFAULT_HEADING = "ابدأ رحلتك نحو علاقةٍ أفضل… اليوم";
const DEFAULT_SUBHEAD =
  "اختر الدورة التي تناسب مرحلتك، أو راسلنا على واتساب وسنساعدك في اختيار الأنسب لك.";
const DEFAULT_PROOF = "انضم إلى آلاف المتدربين والمتدربات";

/**
 * The closing CTA — a light card, not the old vibrant band.
 *
 * The band it replaces was a saturated animated gradient with white text on it;
 * it shouted, and it was the only section on the page that did. This is the
 * quieter, more expensive-looking version of the same job: one soft sheet
 * (`.cta-sheet`), one coral button, and everything else earning its place —
 * eyebrow, headline, subhead, social proof.
 *
 * Coral stays the fill here for the same reason it always was: this is the
 * single most important CTA on the page, which is exactly what the accent is
 * reserved for. On this light ground the emphasised tail of the headline takes
 * `accent-strong` instead — coral as small/medium text fails AA on every ground
 * (3.84:1), and the darkened role token is what exists for that.
 *
 * The Ruqʿah tail is the hero's device, used a second and last time. The page
 * opens on a calligraphic line and closes on one; anywhere in between it would
 * just be decoration. Same `…` convention, so the editor controls the split —
 * see `splitAtEllipsis`.
 */
export function FinalCta({
  eyebrow,
  heading,
  subhead,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  waHref,
  proofLabel,
  testimonials = [],
}: {
  eyebrow?: string | null;
  heading?: string | null;
  subhead?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  waHref?: string | null;
  proofLabel?: string | null;
  /** Real published testimonials — the avatar cluster is their faces or nothing. */
  testimonials?: TestimonialRow[];
}) {
  const { lead, tail } = splitAtEllipsis(heading || DEFAULT_HEADING);
  const faces = testimonials.slice(0, 4);

  return (
    <Section bg="background">
      {/* The mat and the sheet hold still; only what is printed on them moves.
          This is the page's closing ask, so the order is the argument —
          eyebrow, then the headline's Ruqʿah tail, then the reassurance, then
          the button, then the faces backing it up. */}
      <Sequence>
        {/* The card sits in a soft mat rather than directly on the page: the
            sheet is only 1.25:1 against white at its strongest, so a bare edge
            reads as a rendering artefact. The mat gives it a deliberate one. */}
        <div className="rounded-[2.75rem] border border-border bg-surface-strong/40 p-2 sm:p-3">
          <div className="cta-sheet relative overflow-hidden rounded-[2.25rem] px-6 py-14 text-center sm:px-10 md:py-20">
            <p
              data-seq-item
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm text-foreground-muted shadow-sm backdrop-blur-sm"
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {eyebrow || DEFAULT_EYEBROW}
            </p>

            <h2
              data-seq-item
              className="mx-auto mt-6 max-w-2xl text-3xl font-bold text-foreground sm:text-4xl md:text-5xl"
            >
              <span className="block">{lead}</span>
              {tail && (
                <span
                  className="mt-1 block font-calligraphy text-accent-strong"
                  // Ruqʿah sits far outside the em box — its sweeping baseline
                  // and descenders need this leading and the padding, or the
                  // line clips against the block above. Same values as the hero.
                  style={{ lineHeight: 1.72, paddingBottom: "0.14em" }}
                >
                  {tail}
                </span>
              )}
            </h2>

            <p
              data-seq-item
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-foreground-muted"
            >
              {subhead || DEFAULT_SUBHEAD}
            </p>

            <div data-seq-item className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <MagneticLink
                href={primaryUrl || "/الدورات"}
                className={cn(
                  buttonClasses("danger"),
                  "rounded-full px-8 py-3.5 text-lg font-semibold shadow-lg transition-[transform,box-shadow,background-color] duration-200",
                  "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgb(224_79_100_/_0.6)]",
                )}
              >
                {primaryLabel || "تصفح الدورات"}
              </MagneticLink>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonClasses("outline"),
                    "rounded-full bg-background/70 px-6 py-3.5 backdrop-blur-sm",
                  )}
                >
                  <WhatsappGlyph className="size-5" />
                  {secondaryLabel || "تحدث معنا على واتساب"}
                </a>
              )}
            </div>

            {/* Social proof, low in the card and aligned to the start edge —
                a footnote to the ask, not a competing block. Rendered only
                when there are real testimonials to put faces to. */}
            {faces.length > 0 && (
              <div
                data-seq-item
                className="mt-14 flex items-center justify-center gap-3 md:mt-16 md:justify-start"
              >
                <div className="flex flex-row-reverse">
                  {faces.map((t, i) => (
                    <Avatar
                      key={t.id}
                      className={cn("size-10 ring-2 ring-background", i > 0 && "-ms-3")}
                    >
                      {t.avatar_url && <AvatarImage src={t.avatar_url} alt="" />}
                      <AvatarFallback className="text-sm">
                        {t.author_name.trim().charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-start text-sm text-foreground-muted">
                  {proofLabel || DEFAULT_PROOF}
                </p>
              </div>
            )}
          </div>
        </div>
      </Sequence>
    </Section>
  );
}
