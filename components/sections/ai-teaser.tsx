import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Section } from "./section";
import { AiWaitlistForm } from "./ai-waitlist-form";
import { GridHorizon } from "./art/grid-horizon";
import { OrbitField } from "./art/orbit-field";
import { Grain } from "./art/grain";

const FALLBACK_POINTS = ["إجاباتٌ فورية من الدورات", "إرشادٌ بين الدروس", "متاحٌ دائماً"];

export function AiTeaser({
  headline,
  subhead,
  points,
  badge,
}: {
  headline?: string | null;
  subhead?: string | null;
  points: string[];
  badge?: string | null;
}) {
  const items = points.length ? points : FALLBACK_POINTS;

  return (
    <Section bg="background">
      <Reveal>
        {/* The "future" moment. A receding grid plane plus depth-layered orbits
            give this the only literal 3D on the homepage — earned here because
            the section is about the AI assistant, not applied as decoration. */}
        <div className="ai-shimmer relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-on-highlight md:px-12">
          <GridHorizon tone="light" fadeClassName="from-highlight" />
          <OrbitField
            tone="light"
            className="-end-10 -top-12 size-56 opacity-80"
          />
          <Grain opacity={0.07} />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              <Sparkles className="size-4" /> {badge || "قريباً"}
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold md:text-4xl">
              {headline || "مساعدك الذكي للتعلّم"}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-on-highlight/90">
              {subhead ||
                "مساعدٌ ذكيّ مدرَّب على محتوى الأكاديمية، يجيب أسئلتك ويرشدك خطوة بخطوة — متاحٌ على مدار الساعة."}
            </p>

            <Stagger
              as="ul"
              preset="depth"
              amount={0.12}
              className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-on-highlight/90"
            >
              {items.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-white/70" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </Stagger>

            <div className="mt-9 flex justify-center">
              <AiWaitlistForm />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
