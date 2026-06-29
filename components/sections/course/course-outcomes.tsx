import { Target, Brain, ShieldCheck, Compass, Lightbulb, Heart, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { Section, SectionHeading } from "../section";

const ICONS = [Target, Brain, ShieldCheck, Compass, Lightbulb, Heart, CheckCircle2, Sparkles];
const GRADS = ["from-teal to-plum", "from-plum to-teal", "from-plum to-violet", "from-secondary to-plum"];

/** "ماذا ستتعلّم" as a grid of icon cards (mirrors the homepage Outcomes section). */
export function CourseOutcomes({ outcomes }: { outcomes: string[] }) {
  if (!outcomes || outcomes.length === 0) return null;

  return (
    <Section bg="background">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="نتائج الدورة"
          title="ماذا ستتعلّم؟"
          sub="مهاراتٌ عملية تنقلك من المعرفة إلى التطبيق في حياتك."
        />
      </Reveal>

      <Stagger as="ul" preset="flip" className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {outcomes.map((o, i) => {
          const Icon = ICONS[i % ICONS.length];
          const grad = GRADS[i % GRADS.length];
          return (
            <TiltCard
              as="li"
              key={o}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7"
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                  grad,
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-bold leading-snug text-foreground">{o}</p>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-violet/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-80"
              />
            </TiltCard>
          );
        })}
      </Stagger>
    </Section>
  );
}
