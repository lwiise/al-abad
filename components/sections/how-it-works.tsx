import { Compass, GraduationCap, Sparkles } from "lucide-react";
import type { HowItWorksStepRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { SvgDraw } from "@/components/motion/svg-draw";
import { Section, SectionHeading } from "./section";

const FALLBACK: Pick<HowItWorksStepRow, "title" | "description">[] = [
  { title: "اختر دورتك", description: "تصفّح الدورات واختر ما يناسب وضعك" },
  { title: "سجّل وتعلّم على راحتك", description: "ادخل إلى المنصة وتعلّم في أي وقت" },
  { title: "طبّق وحقّق نتائج", description: "حوّل ما تعلمته إلى خطوات عملية" },
];

const ICONS = [Compass, GraduationCap, Sparkles];

export function HowItWorks({
  steps,
  heading,
  subhead,
}: {
  steps: HowItWorksStepRow[];
  heading?: string | null;
  subhead?: string | null;
}) {
  const items = steps.length ? steps : FALLBACK;

  return (
    <Section bg="surface">
      <Reveal>
        <SectionHeading
          title={heading || "كيف تبدأ؟"}
          sub={subhead || "ثلاث خطوات بسيطة من التصفّح إلى التطبيق."}
        />
      </Reveal>

      <div className="relative mt-14">
        {/* flowing connector behind the steps (desktop) */}
        <SvgDraw
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-8 hidden h-20 w-full md:block"
        >
          <defs>
            <linearGradient id="hiw-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0d678b" />
              <stop offset="0.5" stopColor="#a551fc" />
              <stop offset="1" stopColor="#583b66" />
            </linearGradient>
          </defs>
          <path
            data-draw
            d="M 40 40 C 250 -6, 360 -6, 500 40 S 760 86, 960 40"
            stroke="url(#hiw-line)"
            strokeWidth="2.5"
            strokeOpacity="0.5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
        </SvgDraw>

        <Stagger as="ol" preset="flip" className="relative grid gap-6 md:grid-cols-3">
          {items.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <TiltCard
                as="li"
                key={i}
                className="rounded-3xl border border-border bg-background p-8 text-center shadow-sm"
              >
                <span className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-plum to-violet text-white shadow-md">
                  <Icon className="size-7" />
                  <span className="absolute -end-2 -top-2 flex size-7 items-center justify-center rounded-full bg-background text-sm font-extrabold tabular-nums text-plum shadow ring-1 ring-border">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                {step.description && <p className="mt-2 text-foreground-muted">{step.description}</p>}
              </TiltCard>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}
