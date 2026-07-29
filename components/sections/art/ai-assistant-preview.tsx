import type { CSSProperties } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AssistantGlyph } from "@/components/site/icons";
import { FloatGroup } from "@/components/motion/float-group";

/**
 * Section 7's product visual — the assistant, mid-answer.
 *
 * All CSS/SVG, no image request, same as every other diagram in this folder.
 * The device is `aria-hidden`: it is an illustration, and its copy is written
 * around these specific bubble widths, so it is artwork rather than CMS text.
 * The chips beside it are the opposite — they carry the real `ai_points` copy
 * and stay a real list.
 *
 * The one thing this drawing has to say is the source chip: *the answer came
 * out of a course you can buy*. Without it this is a generic chatbot mockup.
 */

/**
 * Scatter positions for the chips, alternating sides so they read right-then-
 * left in RTL. Every `t` stays ≤ 60% so the chips stay level with the device
 * rather than trailing off below it.
 *
 * THE SCATTER NEEDS A GUTTER AS WIDE AS A CHIP, and that is what sets the
 * breakpoint. It used to start at `lg`, when this drawing had the section's full
 * `max-w-6xl` column to itself and 432px of clear ground each side of the
 * device. Section 7 is two columns from lg now (see ai-teaser.tsx), and the two
 * halves of that split measure very differently:
 *
 *   - From xl the container has stopped growing at 1152 and the drawing's column
 *     is 606 of it: 288 of device and 159 each side, against a chip that drops to
 *     163 here (see the `xl:text-xs` note below). Four pixels of that land on the
 *     device's 8px frame and none of it on its screen, which is a pill resting on
 *     the phone's rim — the look the scatter was always after.
 *   - Between lg and xl the column is 430–510 and the gutter 71–111, against a
 *     180px chip. A chip anchored there sits squarely on the chat bubbles, so
 *     across that range they stay the plain wrapped row the phone layout uses,
 *     above the device.
 *
 * `t` is a fraction of the DEVICE's height, since that is what the layer is
 * sized by, and the side offsets are 0–2% — the chips hug the gutter rather than
 * floating in the middle of it, because the gutter is only 159px and the chip is
 * 163. Slots 4–6 are the second column each side, for the six `ai_points` the
 * CMS allows; the seeded three take the first three.
 */
type Slot = { s?: string; e?: string; t: string; r: string };

const CHIP_SLOTS: Slot[] = [
  { s: "0%", t: "6%", r: "-4deg" },
  { e: "0%", t: "36%", r: "3.5deg" },
  { s: "1%", t: "60%", r: "2.5deg" },
  { e: "1%", t: "4%", r: "3deg" },
  { s: "2%", t: "34%", r: "-3deg" },
  { e: "0%", t: "60%", r: "-2.5deg" },
];

export function AiAssistantPreview({ points }: { points: string[] }) {
  return (
    // `isolate` so the bloom's -z-10 stays inside this drawing and cannot land
    // behind the band's dot field, which sits at the same depth one level up.
    //
    // `lg:mt-0` because from lg this is a COLUMN of the section, sitting beside
    // the copy rather than under it — the top margin is the stacked layout's
    // gap, and left in place it would push the drawing below its own column.
    <div className="relative isolate mt-12 md:mt-16 lg:mt-0">
      {/* Below xl these are a plain centered wrap list above the device; from xl
          they scatter around it. Logical start/end, so RTL mirrors for free.

          `xl:z-10` because the device is a positioned sibling LATER in the DOM,
          so without it the two paint in source order and the phone covers any
          chip that reaches it — which is how a chip whose label the owner made
          longer than the gutter would fail. Lifted, the worst case is a pill
          resting ON the device, which is what a floating chip should do anyway. */}
      <FloatGroup
        as="ul"
        className="flex flex-wrap justify-center gap-2.5 xl:pointer-events-none xl:absolute xl:inset-0 xl:z-10 xl:block"
      >
        {points.slice(0, CHIP_SLOTS.length).map((point, i) => {
          const slot = CHIP_SLOTS[i];
          return (
            <li
              key={point}
              data-float
              style={
                {
                  "--chip-s": slot.s ?? "auto",
                  "--chip-e": slot.e ?? "auto",
                  "--chip-t": slot.t,
                  "--chip-r": slot.r,
                } as CSSProperties
              }
              /* A size smaller once they scatter, and that is arithmetic rather
                 than taste: the gutter each side of the device is 159px and a
                 `text-sm` chip measures 183. Widening the gutter instead costs
                 the copy column the same 24px twice over, and it is already at
                 the width where its headline takes a third line. Shrinking the
                 DEVICE is the one move that cannot work at all — it is sized by
                 its own content, so a narrower phone is a TALLER phone. In the
                 row layout below xl there is no gutter to fit, so they stay at
                 the site's normal chip size there. */
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-lg xl:absolute xl:top-[var(--chip-t)] xl:start-[var(--chip-s)] xl:end-[var(--chip-e)] xl:rotate-[var(--chip-r)] xl:px-3 xl:py-1.5 xl:text-xs"
            >
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-highlight" />
              {point}
            </li>
          );
        })}
      </FloatGroup>

      {/* Shown whole, sitting on the band's own ground. It used to be cropped
          by the panel's bottom edge — with no panel there is nothing to crop
          against but the section boundary, and a phone sliced off at the band
          edge reads as a rendering fault, not a product shot.

          On the light band the ink-tinted `--shadow-xl` seated it. On night a
          shadow is invisible — a dark blur on a dark plate — so the light comes
          from the other side instead: a violet bloom the device stands in
          front of. It is also the band's only atmosphere, and it is down HERE
          on purpose. Anywhere higher it would sit under the headline and raise
          the ground's luminance exactly where the type needs it lowest; down
          here everything near it is opaque (this device, the chips) so it costs
          no contrast at all. The shadow stays for the light contexts the
          drawing may be reused in. */}
      {/* Width stays 288 from lg even though the column narrowed: this box is
          sized by its own content, so NARROWING it does not make it smaller —
          the bubbles wrap onto more lines and it gets ~30px TALLER, which is the
          opposite of what a one-screen band needs. Nor is it scaled down: at the
          height budget a 768px window leaves it that would be 58%, and its 12px
          chat text — the source chip is the one thing this drawing has to say —
          would render at 7px. */}
      <div aria-hidden="true" className="relative mx-auto mt-8 w-60 sm:w-64 lg:w-72 xl:mt-0">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-55%] top-[8%] -z-10 h-[76%] rounded-[100%] bg-highlight/25 blur-3xl"
        />
        <div className="rounded-[2rem] border border-border-strong bg-background p-2 shadow-xl">
          <div className="rounded-[1.6rem] bg-surface px-4 pt-3 pb-8">
            <span className="mx-auto block h-1 w-14 rounded-full bg-border-strong" />

            <div className="mt-4 flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-highlight text-on-highlight">
                <AssistantGlyph className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">مساعد الأكاديمية</span>
            </div>

            <div className="mt-4 text-start">
              {/* Outgoing hugs the end edge, incoming the start edge — the RTL
                  chat layout an Arabic reader already knows from WhatsApp. */}
              <p className="ms-auto w-fit max-w-[85%] rounded-xl rounded-es-sm bg-primary px-3 py-2 text-xs leading-relaxed text-on-primary">
                كيف أتعامل مع خلافٍ يتكرّر كل شهر؟
              </p>
              <div className="me-auto mt-2.5 w-fit max-w-[94%] rounded-xl rounded-se-sm border border-border bg-background px-3 py-2.5 shadow-sm">
                <p className="text-xs leading-relaxed text-foreground">
                  ابدأ بفصل الموضوع عن الشخص، ثم اتفقا على وقتٍ هادئ تتحدثان فيه وحده.
                </p>
                {/* The label is plum, not violet: violet at this size is 4.05:1
                    and fails. Violet stays in the glyph and the tint — both
                    graphics, both above the 3:1 threshold. */}
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-highlight/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <BookOpen className="size-3 shrink-0 text-highlight" />
                  من دورة: التواصل الزوجي
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
              <span className="h-1.5 flex-1 rounded-full bg-border" />
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-highlight text-on-highlight">
                <ArrowLeft className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
