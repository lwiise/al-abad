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
    <Section bg="background">
      {/* Sequenced rather than revealed as a slab: the panel is a stack of
          distinct objects — icon, chip, headline, subhead, form, mockup — and
          sliding the whole card up as one rectangle showed none of them. Each
          part now arrives in reading order; see components/motion/sequence.tsx. */}
      <Sequence>
        {/* The band stays white; this panel does the separating — bg-surface
            behind a hairline border, a soft shadow and the dot texture at its
            rim. It was a violet .ai-shimmer card, which it shared verbatim with
            the final CTA one screen later: same radius, same AiOrbit corner,
            only the hue differed, so the page said the same thing twice.
            Violet still marks the section — as fills on a light ground. */}
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface px-6 pt-14 text-center shadow-lg sm:px-10 md:pt-16">
          <span aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 -z-10" />

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
              and it should not have to know about the entrance system. Its
              device deliberately bleeds past the panel's bottom edge (-mb-16,
              clipped by the panel's overflow-hidden), so the rise reads as the
              mockup sliding up into the card. */}
          <div data-seq-item>
            <AiAssistantPreview points={items} />
          </div>
        </div>
      </Sequence>
    </Section>
  );
}
