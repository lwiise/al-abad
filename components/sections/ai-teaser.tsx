import { Sequence } from "@/components/motion/sequence";
import { AssistantGlyph } from "@/components/site/icons";
import { splitAtEllipsis } from "@/lib/utils";
import { Section } from "./section";
import { AiWaitlistForm } from "./ai-waitlist-form";
import { AiAssistantPreview } from "./art/ai-assistant-preview";
import { AiParticleField } from "./art/ai-particle-field";

const FALLBACK_HEADLINE = "سؤالك لا ينتظر موعد الدرس… مساعدك الذكي يجيب فوراً";
const FALLBACK_SUBHEAD =
  "مساعدٌ ذكيّ مدرَّب على محتوى الأكاديمية، يجيب أسئلتك ويرشدك خطوة بخطوة — متاحٌ على مدار الساعة.";
const FALLBACK_POINTS = ["إجاباتٌ فورية من الدورات", "إرشادٌ بين الدروس", "متاحٌ دائماً"];

export function AiTeaser({
  headline,
  subhead,
  points,
  badge,
  ctaLabel,
  note,
}: {
  headline?: string | null;
  subhead?: string | null;
  points: string[];
  badge?: string | null;
  ctaLabel?: string | null;
  note?: string | null;
}) {
  const items = points.length ? points : FALLBACK_POINTS;
  const { lead, tail } = splitAtEllipsis(headline || FALLBACK_HEADLINE);

  return (
    /* A `night` band with a live dot field for a ground — the reference clip
       the owner asked this section to look like, drawn in the palette rather
       than in its black and white. See art/ai-particle-field.tsx for the field
       itself and section.tsx for what `night` is.

       WHY THE SECTION WENT DARK. The effect is a bright lattice on a deep
       plate; on the light `surface` band this section used to carry there is
       nothing for a dot to be brighter THAN, and the same field comes out as
       grey speckle on lavender. So the ground had to move, and once it moves it
       takes the sanctioned dark route: neutral-900, white and lilac for type,
       violet as fills only, buttons through `buttonClasses(…, light)`.

       WHAT THAT COSTS AND WHAT IT BUYS. Cost: the page now has two dark anchors
       (3 and 7) instead of one, and section 7's violet HEADLINE TAIL is lilac
       now — violet is 3.68:1 on the bare plate but 2.34:1 once a guarded dot is
       behind it, so it cannot be text here. Buys: section 6 → 7 was the site's
       one 1.07:1 band boundary, faint by owner decision and needing the dot
       texture and the violet fills to mark it at all. That boundary is now the
       hardest cut on the page, and the AI section is the one place a hard cut
       is the point.

       WHAT STILL SEPARATES 7 FROM 10, since they used to converge: shape (7 is
       an open band, 10 a `.cta-sheet` card in a lilac mat), ground (night vs
       light), hue (7 is violet — the tile, the chip, the field's troughs — 10
       is coral), the accent line's typeface (10 sets its tail in Ruqʿah; 7 no
       longer accents its tail at all), and what fills them. They are further
       apart than before, not closer. */
    <Section
      bg="night"
      /* ONE SCREEN — `min-h-[90svh]`, content centred in it. See `screen` in
         section.tsx for why it is a floor and not a fixed height.

         WHY THE LAYOUT IS TWO COLUMNS FROM lg. As one centred stack this
         section measured 1032px: 840 of content — tile 72, chip 34, headline
         94, subhead 59, form 92, mockup 332, and 157 of gaps between them —
         under 192 of band padding. Against a 90vh budget that is 1.5 screens on
         a 1366×768 laptop and 1.27 on a 1440×900, which is the overflow this
         rewrite answers.

         Compressing the stack does not close that gap. The two candidates were
         measured before this was written:

           - Tighter rhythm alone (height-aware padding and gaps, smaller tile)
             recovers ~90px. It fits 90vh only above a ~1000px window; every
             laptop still overflows.
           - Scaling the mockup closes the rest arithmetically — and at
             1366×768 the budget left for it is 191px against its natural 332,
             i.e. 58%, which renders its 12px chat text at 7px. The drawing's
             whole job is the source chip reading `من دورة: التواصل الزوجي`
             (see the note in ai-assistant-preview.tsx). An illegible mockup is
             not a mockup.

         So the height had to come out of the LAYOUT, and the axis a 1366×768
         window has to spare is the horizontal one. Side by side, the band is
         `max(copy, mockup) + padding` instead of the sum of the two, which fits
         a 768px window with room over and leaves the mockup at full size and
         the type at full size. Below lg it is the stacked centred column it has
         always been.

         WHERE THIS GIVES UP, stated rather than hidden: on a phone the stack is
         ~1170px against a 760px budget, and no arrangement of a headline, a
         subhead, an email capture, three feature chips and a product shot fits
         one 390×844 screen. Something would have to be deleted — the mockup is
         `aria-hidden` artwork and is the obvious candidate — and a marketing
         section that drops its product shot on the majority of its traffic is a
         worse outcome than a band that scrolls. So 90svh is the floor there and
         the band grows past it. Do not "fix" that by hiding the preview.

         WHAT THE TWO COLUMNS COST THE FIELD, and why it is not a regression:
         the copy is no longer centred, so the quiet zone the dots damp
         themselves into cannot be a fixed ellipse at the band's centre any
         more. The field now MEASURES the block it has to keep legible — the
         `data-ai-copy` box below — which is both correct for this layout and
         correct for the stacked one, where the old fixed 34%-of-band centre was
         a heuristic that drifted as the copy wrapped. It also lands the field's
         bright half over the mockup's column, where the only things standing on
         it are opaque. */
      screen
      className="overflow-hidden"
      /* Full-bleed, so the field is the page's ground and not a texture inside
         a content column — a lattice stopping at max-w-6xl would just redraw
         the panel edge this section spent a redesign getting rid of. The field
         damps ITSELF where the type is (see GUARD in the component) rather than
         being masked: a CSS mask on this layer could only cut a rectangle, and
         it is the smooth falloff that keeps the quiet zone from reading as a
         panel. */
      /* `forced-colors:hidden` because a canvas is CONTENT, not a background:
         Windows High Contrast repaints the band with the reader's own colours
         and strips our backgrounds, but it cannot touch pixels we drew, so the
         field would survive as violet dots over whatever ground the reader
         chose — decoration outliving the palette it was measured against. */
      bleed={
        <AiParticleField
          guard="[data-ai-copy]"
          className="pointer-events-none absolute inset-0 -z-10 size-full forced-colors:hidden"
        />
      }
    >
      {/* Sequenced rather than revealed as a slab: this is a stack of distinct
          objects — icon, chip, headline, subhead, form, mockup — and sliding
          them up as one rectangle showed none of them. Each part now arrives in
          reading order; see components/motion/sequence.tsx. */}
      <Sequence>
        {/* The split is not even, and it changes at xl, because the two columns
            hold different things — measured, not guessed.

            From xl the mockup's column carries the chips SCATTERED around the
            device, so it needs the device's 288 plus a gutter each side: 606 of
            the 1072 that is left of the 1152 container once its padding and the
            gap come out. The 466 that leaves the copy is the narrowest this
            column gets before its headline takes a fourth line and the band stops
            fitting a 673px window, which is what pins the ratio at 1:1.3.

            Below xl the chips are a plain row above the device instead (there is
            no gutter to scatter into at that width — see
            ai-assistant-preview.tsx), so the column only has to hold the device
            and the copy takes the larger half back.

            Copy first in the DOM, which is both reading order and the order the
            sequence arrives in. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] xl:gap-x-8">
          {/* The block the field guards, and the reason it is one element: the
              dots read its box, so anything that must stay legible on the dark
              plate belongs INSIDE it. The mockup and the chips are deliberately
              outside — they are opaque, they carry their own ground, and
              guarding them would damp the field across the whole band. */}
          <div data-ai-copy className="text-center lg:text-start">
            <span
              data-seq-item
              className="ai-tile mx-auto flex size-16 items-center justify-center rounded-xl bg-highlight text-on-highlight md:size-18 lg:mx-0"
            >
              <AssistantGlyph className="size-8 md:size-9" />
            </span>

            {/* Violet-tinted chip with a lilac label. Same fill-vs-text split it
                had on the light band, resolved for dark: the fill and the dot are
                graphics and clear 3:1, while the label takes the dark-ground text
                colour — 10.15:1 on the tint. Plum, which carried this label on
                white, is 1.26:1 here and unusable. */}
            <span
              data-seq-item
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-highlight/40 bg-highlight/15 px-3.5 py-1.5 text-sm font-medium text-lilac"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
              {badge || "قريباً"}
            </span>

            {/* max-w-3xl is the CENTRED measure; in the two-column layout the
                column is the measure and the cap would only ever cut it short of
                its own half. */}
            <h2
              data-seq-item
              className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-white md:text-4xl lg:mx-0 lg:max-w-none"
            >
              <span className="block">{lead}</span>
              {/* Lilac, not violet — see the band note above. Flat either way:
                  a violet→blue ramp on a dark plate is the same generic look the
                  palette notes rule out on white. */}
              {tail && <span className="mt-1 block text-lilac">{tail}</span>}
            </h2>

            <p
              data-seq-item
              className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-neutral-300 lg:mx-0"
            >
              {subhead || FALLBACK_SUBHEAD}
            </p>

            <div data-seq-item className="mt-8 flex justify-center lg:mt-7 lg:justify-start">
              <AiWaitlistForm ctaLabel={ctaLabel} note={note} />
            </div>
          </div>

          {/* Wrapped rather than marked on its own root: the preview is art,
              and it should not have to know about the entrance system. On the
              light band the device was seated by its shadow; on night a shadow
              is invisible, so it is seated by the violet bloom the preview
              carries instead. The rise still reads as the mockup arriving last,
              which is all the sequence needs from it. */}
          <div data-seq-item>
            <AiAssistantPreview points={items} />
          </div>
        </div>
      </Sequence>
    </Section>
  );
}
