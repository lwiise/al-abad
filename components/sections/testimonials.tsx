import Link from "next/link";
import type { TestimonialRow } from "@/lib/database.types";
import { Sequence } from "@/components/motion/sequence";
import { buttonClasses } from "@/components/ui/button";
import { cn, splitAtEllipsis } from "@/lib/utils";
import { Section } from "./section";
import { TestimonialDeck } from "./testimonial-deck";

const DEFAULT_EYEBROW = "آراء المتدربين";
const DEFAULT_HEADING = "بعضٌ مما قاله الأحباب… بكلماتهم هم";
const DEFAULT_SUBHEAD =
  "كلماتٌ من أزواجٍ وزوجاتٍ ساروا في الطريق نفسه، وكتبوا ما تغيّر في بيوتهم بعد التطبيق.";
const DEFAULT_PROOF = "انضم إلى آلاف المتدربين والمتدربات الذين بدأوا من حيث أنت الآن.";
const DEFAULT_CTA = "ابدأ رحلتك";

/**
 * الآراء — a lit plum band carrying a fanned deck of quote cards.
 *
 * The owner gave this section a reference frame: a deep dark ground with a
 * violet bloom sweeping across it, a pill, a large two-line headline, a subhead,
 * a stack of three pale quote cards with an arrow either side, a proof line and
 * a button. This is that composition in the brand's own colours — see
 * `.tm-plate` in globals.css for the ground and `testimonial-deck.tsx` for the
 * stack.
 *
 * WHY PLUM AND NOT A THIRD DARK NEUTRAL. Section 7 immediately above is already
 * a full-bleed `night` band, so a second neutral-900 band here would put two
 * dark grounds back to back with no boundary at all — the exact failure
 * `Section` documents for white-on-surface, at the other end of the ramp.
 * `plum` is 1.58:1 against neutral-900 AND a hue step rather than only a
 * luminance one, and it is the last unused tone in the `<Section bg>` set, so
 * this invents nothing. The top edge is where the boundary is read and the
 * bloom is at the top edge, so where the two bands actually meet the step is
 * 2.03:1 — the second hardest cut on the page after 6 → 7.
 *
 * WHAT IT COSTS, AND CLAUDE.md's OWNER DECISION. This band was white, by an
 * explicit owner decision recorded in CLAUDE.md, and the reference supersedes
 * that decision rather than overriding it quietly. Going dark also breaks up the
 * 8·9·10 run of three white bands the same note describes as the page's weakest
 * stretch: the run is 9·10 now, and الآراء → الأسئلة is a 9.41:1 cut instead of
 * a card edge doing a band's work.
 *
 * WHAT IT COSTS ON THE PALETTE. Coral is 2.45:1 on plum and violet is 2.32:1 —
 * both below even the 3:1 graphics threshold, so NEITHER is usable here, as a
 * fill or otherwise. That is not a limitation to work around, it is the thing
 * that keeps this band from becoming section 7 in another hue: what is left is
 * white, lilac and neutral-300, which is exactly the reference's own
 * white-and-periwinkle. Violet stays section 7's, coral stays section 10's.
 *
 * WHAT SEPARATES IT FROM 7 AND FROM 10, since three of the eleven sections now
 * carry a badge over a centred headline: ground (plum vs night vs a light
 * sheet), hue (lilac vs violet vs coral), shape (7 is an open band, 10 a card in
 * a mat, 8 an open band whose CARDS are the object), and what fills them —
 * 7 has a device mockup and a form, 10 has buttons and faces, 8 has a stack the
 * reader pages through. The pill itself is shared on purpose: it is the hero's
 * trust badge, and CLAUDE.md already calls that a system rather than a
 * duplicate. This one carries no dot and no fill, which is what tells it apart
 * from section 7's violet-tinted chip one screen up.
 */
export function Testimonials({
  testimonials,
  eyebrow,
  heading,
  subhead,
  proof,
  ctaLabel,
  ctaUrl,
}: {
  testimonials: TestimonialRow[];
  eyebrow?: string | null;
  heading?: string | null;
  subhead?: string | null;
  proof?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}) {
  if (testimonials.length === 0) return null;

  const { lead, tail } = splitAtEllipsis(heading || DEFAULT_HEADING);

  return (
    <Section
      bg="plum"
      /* `overflow-hidden` clips the relief's mask and the deck's shadow at the
         band edges; without it the card's 60px blur would smear into section 9's
         white one. */
      className="tm-plate overflow-hidden"
      /* Full-bleed, outside the `max-w-6xl` container — a texture rendered as a
         child would stop at the content column and draw the panel edge this
         section has no business having. */
      bleed={
        <span
          aria-hidden="true"
          className="tm-najdi pointer-events-none absolute inset-0 -z-10"
        />
      }
    >
      {/* Sequenced, not revealed as a slab: this is six distinct objects — pill,
          headline, subhead, deck, proof, button — and sliding them up as one
          rectangle shows none of them. Same reading as sections 7 and 10. */}
      <Sequence className="text-center">
        {/* No fill and no dot, unlike section 7's chip and section 10's eyebrow.
            Lilac on the plate is 7.55:1, and 5.88:1 at the bloom's brightest
            pixel — the hairline is decorative. */}
        <p
          data-seq-item
          className="inline-flex items-center rounded-full border border-white/25 px-4 py-1.5 text-sm font-medium text-lilac"
        >
          {eyebrow || DEFAULT_EYEBROW}
        </p>

        {/* Bold, not the reference's light display weight. Readex at 300 on a
            dark ground halates — Arabic strokes are thin and the counters close
            up — and every other h2 on the site is bold, so a single light one
            would read as a rendering fault rather than as a choice.

            The tail is lilac, the same device sections 7 and 10 use and the same
            reason: it is the one accent this band can afford, and at 30px+ it
            clears the large-text threshold with room to spare (5.88:1 at the
            bloom's peak). */}
        <h2
          data-seq-item
          className="mx-auto mt-6 max-w-3xl text-3xl font-bold text-white sm:text-4xl md:text-5xl"
        >
          <span className="block">{lead}</span>
          {tail && <span className="mt-2 block text-lilac">{tail}</span>}
        </h2>

        <p
          data-seq-item
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-300"
        >
          {subhead || DEFAULT_SUBHEAD}
        </p>

        <div data-seq-item className="mt-12 md:mt-14">
          <TestimonialDeck items={testimonials} />
        </div>

        <p data-seq-item className="mx-auto mt-12 max-w-lg text-sm text-neutral-300">
          {proof || DEFAULT_PROOF}
        </p>

        {/* Lilac on plum, via `buttonClasses(…, light)` — the sanctioned
            dark-ground primary. NOT coral: this is not the page's key CTA (that
            is section 10's, two sections down) and coral is 2.45:1 on this
            ground anyway. Seated by light rather than by shade, which is what
            `.tm-cta` is. */}
        <div data-seq-item className="mt-6">
          <Link
            href={ctaUrl || "/الدورات"}
            className={cn(
              buttonClasses("primary", "md", true),
              "tm-cta rounded-full px-8 py-3.5 text-lg font-semibold",
            )}
          >
            {ctaLabel || DEFAULT_CTA}
          </Link>
        </div>
      </Sequence>
    </Section>
  );
}
