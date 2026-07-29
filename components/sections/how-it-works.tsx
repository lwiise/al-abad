import type { HowItWorksStepRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { HowItWorksSteps } from "./how-it-works-steps";
import { Section, SectionHeading } from "./section";

const FALLBACK: Pick<HowItWorksStepRow, "title" | "description">[] = [
  { title: "اختر دورتك", description: "تصفّح الدورات واختر ما يناسب وضعك" },
  { title: "سجّل وتعلّم على راحتك", description: "ادخل إلى المنصة وتعلّم في أي وقت" },
  { title: "طبّق وحقّق نتائج", description: "حوّل ما تعلمته إلى خطوات عملية" },
];

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
    <Section bg="lilac">
      <Reveal>
        <SectionHeading
          title={heading || "كيف تبدأ؟"}
          sub={subhead || "ثلاث خطوات بسيطة من التصفّح إلى التطبيق."}
        />
      </Reveal>

      {/* Each step holds the screen on its own — see how-it-works-steps.tsx.
          The dotted connector that used to run behind three side-by-side cards
          went with them: nothing is side by side any more, and the rail under
          the stage is what says where you are. */}
      <HowItWorksSteps steps={items} />
    </Section>
  );
}
