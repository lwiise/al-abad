import { Reveal } from "@/components/motion/reveal";
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
    /* A plain white band, the same full-width sheet every other section is
       printed on — no inset card. Two earlier versions boxed this content: a
       violet `.ai-shimmer` card (which it shared verbatim with the final CTA one
       screen later, so the page said the same thing twice), then a `bg-surface`
       panel behind a hairline border. Both fenced the section off inside a
       column narrower than the page, and the grey ground read as a widget
       dropped onto the site rather than part of it.

       What is left to separate section 7 from section 6 — also white — is not a
       band tone: it is the dot texture framing the full width, the violet
       app-icon tile opening the section, and the violet headline tail. Violet
       still marks the section, as fills on a light ground. */
    <Section
      bg="background"
      className="overflow-hidden"
      /* Full-bleed, so the dots frame the page and not a content column: with
         the panel gone, a texture stopping at max-w-6xl would just redraw the
         card edge in dots. Its mask fades INWARD, so nothing lands behind the
         type — see `.dot-grid` in globals.css. */
      bleed={
        <span aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 -z-10" />
      }
    >
      <Reveal>
        <div className="text-center">
          <span className="ai-tile mx-auto flex size-16 items-center justify-center rounded-xl bg-highlight text-on-highlight md:size-18">
            <AssistantGlyph className="size-8 md:size-9" />
          </span>

          {/* A violet-tinted chip with a plum label, not violet text: #a551fc at
              14px is 4.05:1 and fails. The violet lives in the fill and the dot,
              which are graphics and clear 3:1. */}
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3.5 py-1.5 text-sm font-medium text-primary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-highlight" />
            {badge || "قريباً"}
          </span>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-foreground md:text-4xl">
            <span className="block">{lead}</span>
            {/* Flat violet, never a gradient — 30px bold clears the large-text
                threshold, and a violet→blue ramp on white is the exact generic
                look the palette notes rule out. */}
            {tail && <span className="mt-1 block text-highlight">{tail}</span>}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-foreground-muted">
            {subhead || FALLBACK_SUBHEAD}
          </p>

          <div className="mt-8 flex justify-center">
            <AiWaitlistForm ctaLabel={ctaLabel} note={note} />
          </div>

          <AiAssistantPreview points={items} />
        </div>
      </Reveal>
    </Section>
  );
}
