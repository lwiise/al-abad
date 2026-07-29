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

         THE LAYOUT IS UNCHANGED: one centred column, tile → chip → headline →
         subhead → form → mockup, at every width it has ever had. Fitting 90vh is
         done by COMPRESSION, in the order that costs the design least:

           1. The band's padding, which was 192px at md — more than a fifth of a
              900px window — and is now height-aware (section.tsx). Worth ~100px
              at a 768px window and invisible at any height.
           2. The gaps between the six parts, likewise height-aware: the clamps
              below hold the current rhythm on a tall window and tighten it on a
              short one. Worth ~60px more, and also invisible — nothing changes
              size, only the air between things.
           3. The tile and the headline, the only two parts of the copy that
              compress: the tile is a decorative icon and the headline clamps
              between 28 and 36px the way hero.tsx's does. ~30px, and the last
              compression that touches anything the reader looks at.
           4. The mockup, which after 1–3 is still the one thing over budget on
              any window shorter than ~1000px. It scales with the window height
              (`.ai-mock` in globals.css).

         AND THE MOCKUP TAKES EVERYTHING THAT IS LEFT. The band's bottom padding
         is zero here (`pb-0`) and the mockup is bottom-aligned in a `flex-1` box,
         so the drawing runs from under the form to the band's bottom EDGE with no
         dead air below it — which is what it had before, ~100px of empty plate
         between a shrunken phone and the boundary. Everything the compression
         above frees up goes into the drawing rather than into padding, and the
         scale ladder is set from that larger budget: it reaches 1 near a 975px
         window and goes ABOVE 1 past that — 1.37, or 395px wide, from 1105px up,
         which is larger than the drawing was ever drawn at. Any slack past that
         cap opens up between the form and the phone, where it is invisible, rather
         than under the phone, where it read as a gap.

         WHAT THAT COSTS, stated because it is a real cost: on a short window the
         phone still scales below 1 — 0.59 at a 768px window, 0.50 at 673 — so its
         12px chat text renders at 7px and then 6px, and the source chip reads as a
         shape rather than as words. Nothing the reader has to READ is compressed:
         the subhead, the form, the note and the chips keep their sizes at every
         height, and the headline never goes below 28px.

         WHY THE FIELD'S GUARD IS NOW MEASURED. The quiet zone the dots damp
         themselves into used to be an ellipse at a FIXED place — 34% of the band
         height down. Every one of the four compressions above moves the copy, so
         it no longer sits where that assumed; the field reads the `data-ai-copy`
         box below and guards exactly that instead. It fixes an older drift too:
         the fixed centre slid off the copy as soon as the headline wrapped to a
         fifth line on a phone. */
      screen
      /* `pb-0` so the mockup can reach the band's bottom edge — see the note
         above. The top padding stays: the copy needs its clearance from the
         boundary above, and from the nav when the band is scrolled to the top of
         the window. */
      className="overflow-hidden pb-0"
      /* The container and the sequence both have to STRETCH for the mockup's
         `flex-1` to have anything to grow into: the container is the band's flex
         item, the sequence is the container's, and a chain of `flex-1` is what
         turns "90svh tall" into "the drawing gets whatever the copy does not". */
      containerClassName="flex flex-1 flex-col"
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
      <Sequence className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col text-center">
          {/* WORDS INSIDE, ARTWORK OUTSIDE. The dot field reads this box and
              holds itself to GUARD_MIN across it, so everything the reader has to
              READ on the dark plate belongs in here. The mockup and the chips are
              deliberately its siblings, not its children: they are opaque, they
              carry their own ground, and guarding them would damp the field
              across the whole band and leave the art nothing to be bright in.

              The gaps below are `clamp(floor, Nsvh, current)` — the rhythm as it
              is on a tall window, tightening on a short one. It is the cheapest
              height in the section: nothing changes size, only the air between
              things, and it is worth ~60px at a 768px window. */}
          <div data-ai-copy>
            {/* The tile is height-aware too, and it is the only part of the copy
                block that is: it is a decorative app icon rather than something
                to read, so 24px off it on a short window costs nothing, and every
                pixel the copy gives back is a pixel the mockup keeps. The cap is
                the `md:size-18` it used to be. */}
            <span
              data-seq-item
              className="ai-tile mx-auto flex size-[clamp(3rem,7svh,4.5rem)] items-center justify-center rounded-xl bg-highlight text-on-highlight"
            >
              <AssistantGlyph className="size-[clamp(1.5rem,3.5svh,2.25rem)]" />
            </span>

            {/* Violet-tinted chip with a lilac label. Same fill-vs-text split it
                had on the light band, resolved for dark: the fill and the dot are
                graphics and clear 3:1, while the label takes the dark-ground text
                colour — 10.15:1 on the tint. Plum, which carried this label on
                white, is 1.26:1 here and unusable. */}
            <span
              data-seq-item
              className="mt-[clamp(1rem,2.4svh,1.5rem)] inline-flex items-center gap-2 rounded-full border border-highlight/40 bg-highlight/15 px-3.5 py-1.5 text-sm font-medium text-lilac"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
              {badge || "قريباً"}
            </span>

            {/* Height-aware between 28 and 36px — the same device hero.tsx uses
                on its own headline, and the same reason: on a short window the
                axis that is scarce is the vertical one, so the size that matters
                is a fraction of the HEIGHT. `min()` with a vw term so a narrow
                window cannot blow it up. The cap is `md:text-4xl`, the floor is
                just under the mobile `text-3xl`, and the line-height still comes
                from the class. It is the one piece of real copy that compresses,
                and it gives back ~6px of a 2-line headline; the subhead, the form
                and the note keep their sizes at every height. */}
            <h2
              data-seq-item
              className="mx-auto mt-[clamp(0.5rem,1.7svh,1rem)] max-w-3xl text-3xl font-bold text-white md:text-4xl"
              style={{ fontSize: "clamp(1.75rem, min(3.6vw, 4.4svh), 2.25rem)" }}
            >
              <span className="block">{lead}</span>
              {/* Lilac, not violet — see the band note above. Flat either way:
                  a violet→blue ramp on a dark plate is the same generic look the
                  palette notes rule out on white. */}
              {tail && <span className="mt-1 block text-lilac">{tail}</span>}
            </h2>

            <p
              data-seq-item
              className="mx-auto mt-[clamp(0.5rem,1.7svh,1rem)] max-w-2xl text-lg leading-relaxed text-neutral-300"
            >
              {subhead || FALLBACK_SUBHEAD}
            </p>

            <div data-seq-item className="mt-[clamp(1.25rem,3.4svh,2rem)] flex justify-center">
              <AiWaitlistForm ctaLabel={ctaLabel} note={note} />
            </div>
          </div>

          {/* Wrapped rather than marked on its own root: the preview is art,
              and it should not have to know about the entrance system. On the
              light band the device was seated by its shadow; on night a shadow
              is invisible, so it is seated by the violet bloom the preview
              carries instead. The rise still reads as the mockup arriving last,
              which is all the sequence needs from it.

              `flex-1` + `items-end` is what puts the drawing ON the band's bottom
              edge: this box takes every pixel the copy leaves, and the mockup sits
              at the bottom of it. Any height the scale ladder cannot use — a very
              tall window, past the 1.35 cap — opens as air ABOVE the phone rather
              than as a gap below it. `min-h-0` because a flex item's default
              `min-height: auto` refuses to shrink below its content, which on a
              phone (where the band is already over 90svh) would have this box
              fighting the copy for room instead of just taking what is left. */}
          <div data-seq-item className="flex min-h-0 flex-1 items-end justify-center">
            <AiAssistantPreview points={items} />
          </div>
        </div>
      </Sequence>
    </Section>
  );
}
