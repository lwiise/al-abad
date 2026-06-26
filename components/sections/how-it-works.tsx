import type { HowItWorksStepRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Section, SectionHeading } from "./section";

const FALLBACK: Pick<HowItWorksStepRow, "title" | "description">[] = [
  { title: "اختر دورتك", description: "تصفّح الدورات واختر ما يناسب وضعك" },
  { title: "سجّل وتعلّم على راحتك", description: "ادخل إلى المنصة وتعلّم في أي وقت" },
  { title: "طبّق وحقّق نتائج", description: "حوّل ما تعلمته إلى خطوات عملية" },
];

export function HowItWorks({ steps }: { steps: HowItWorksStepRow[] }) {
  const items = steps.length ? steps : FALLBACK;

  return (
    <Section bg="surface">
      <Reveal>
        <SectionHeading title="كيف تبدأ؟" sub="ثلاث خطوات بسيطة من التصفّح إلى التطبيق." />
      </Reveal>
      <Stagger as="ol" className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((step, i) => (
            <li
              key={i}
              className="rounded-3xl border border-border bg-background p-7 text-center transition-shadow hover:shadow-md"
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/10 text-2xl font-extrabold tabular-nums text-secondary">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
              {step.description && <p className="mt-2 text-foreground-muted">{step.description}</p>}
            </li>
          ))}
      </Stagger>
    </Section>
  );
}
