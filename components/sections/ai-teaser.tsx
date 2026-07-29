import { Sequence } from "@/components/motion/sequence";
import { AssistantGlyph } from "@/components/site/icons";
import { splitAtEllipsis } from "@/lib/utils";
import { Section } from "./section";
import { AiWaitlistForm } from "./ai-waitlist-form";
import { AiAssistantPreview } from "./art/ai-assistant-preview";

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
    /* The `surface` tone the section has always had, now carried by the BAND
       rather than by a card. It was an inset panel — same #f8f6fb, but behind a
       `rounded-[2rem]` border with a shadow — and before that a violet
       `.ai-shimmer` card, which shared its formula verbatim with the final CTA
       one screen later, so the page said the same thing twice. Boxing the
       content into a column narrower than the page made it read as a widget
       dropped onto the site; the tone belongs to the section, so the section
       takes it edge to edge.

       This is the site's one white/`surface` band adjacency, and it is an owner
       decision — section 6 above is `background`, and #f8f6fb against #ffffff is
       1.07:1, so that boundary is faint by design. What carries the section is
       the tone plus the dot texture in the gutters, the violet app-icon tile and
       the violet headline tail. Violet stays fills-on-a-light-ground. Don't
       generalise this into alternating white and surface elsewhere — see the
       `Section` bg map. */
    <Section
      bg="surface"
      className="overflow-hidden"
      /* Full-bleed, so the dots frame the page and not a content column: with
         the panel gone, a texture stopping at max-w-6xl would just redraw the
         card edge in dots. Its mask fades INWARD, so nothing lands behind the
         type — see `.dot-grid` in globals.css. It has to be this separate layer
         and never the band itself: `mask-image` masks `background-color` too, so
         masking the section would eat the surface tone along with the dots. */
      bleed={
        <span aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 -z-10" />
      }
    >
      {/* Sequenced rather than revealed as a slab: this is a stack of distinct
          objects — icon, chip, headline, subhead, form, mockup — and sliding
          them up as one rectangle showed none of them. Each part now arrives in
          reading order; see components/motion/sequence.tsx. */}
      <Sequence>
        <div className="text-center">
          <span
            data-seq-item
            className="ai-tile mx-auto flex size-16 items-center justify-center rounded-xl bg-highlight text-on-highlight md:size-18"
          >
            <AssistantGlyph className="size-8 md:size-9" />
          </span>

          {/* A violet-tinted chip with a plum label, not violet text: #a551fc at
              14px is 4.05:1 and fails. The violet lives in the fill and the dot,
              which are graphics and clear 3:1. */}
          <span
            data-seq-item
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3.5 py-1.5 text-sm font-medium text-primary"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
            {badge || "قريباً"}
          </span>

          <h2
            data-seq-item
            className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-foreground md:text-4xl"
          >
            <span className="block">{lead}</span>
            {/* Flat violet, never a gradient — 30px bold clears the large-text
                threshold, and a violet→blue ramp on white is the exact generic
                look the palette notes rule out. */}
            {tail && <span className="mt-1 block text-highlight">{tail}</span>}
          </h2>

          <p
            data-seq-item
            className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-foreground-muted"
          >
            {subhead || FALLBACK_SUBHEAD}
          </p>

          <div data-seq-item className="mt-8 flex justify-center">
            <AiWaitlistForm ctaLabel={ctaLabel} note={note} />
          </div>

          {/* Wrapped rather than marked on its own root: the preview is art,
              and it should not have to know about the entrance system. The
              device is shown whole and seated by its shadow — it has not bled
              past the band since the panel was dropped, because the only edge
              left to bleed against is the section boundary. The rise still
              reads as the mockup arriving last, which is all the sequence
              needs from it. */}
          <div data-seq-item>
            <AiAssistantPreview points={items} />
          </div>
        </div>
      </Sequence>
    </Section>
  );
}
