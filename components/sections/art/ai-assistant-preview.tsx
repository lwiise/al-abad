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
 * The scatter starts at `lg`, not `md`: at 768px the content column is barely
 * wider than the device, so a ~200px chip at the rim runs past the column and
 * into the band's edge. Below lg they are a plain wrapped row instead.
 */
type Slot = { s?: string; e?: string; t: string; r: string };

const CHIP_SLOTS: Slot[] = [
  { s: "3%", t: "8%", r: "-4deg" },
  { e: "4%", t: "34%", r: "3.5deg" },
  { s: "6%", t: "58%", r: "2.5deg" },
  { e: "8%", t: "6%", r: "3deg" },
  { s: "10%", t: "36%", r: "-3deg" },
  { e: "2%", t: "56%", r: "-2.5deg" },
];

export function AiAssistantPreview({ points }: { points: string[] }) {
  return (
    // `isolate` so the bloom's -z-10 stays inside this drawing and cannot land
    // behind the band's dot field, which sits at the same depth one level up.
    <div className="relative isolate mt-12 md:mt-16">
      {/* Below lg these are a plain centered wrap list above the device; from lg
          they scatter around it. Logical start/end, so RTL mirrors for free. */}
      <FloatGroup
        as="ul"
        className="flex flex-wrap justify-center gap-2.5 lg:pointer-events-none lg:absolute lg:inset-0 lg:block"
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
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-lg lg:absolute lg:top-[var(--chip-t)] lg:start-[var(--chip-s)] lg:end-[var(--chip-e)] lg:rotate-[var(--chip-r)]"
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
      <div aria-hidden="true" className="relative mx-auto mt-8 w-60 sm:w-64 lg:mt-0 lg:w-72">
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
