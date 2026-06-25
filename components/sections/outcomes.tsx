import { Check } from "lucide-react";
import { Section, SectionHeading } from "./section";

const FALLBACK = [
  "مهارات تواصل أعمق",
  "فهمٌ لدوافع السلوك",
  "أدوات عملية لحل الخلافات",
  "ثقة في قراراتك الزوجية",
];

export function Outcomes({ points }: { points: string[] }) {
  const items = points.length ? points : FALLBACK;

  return (
    <Section bg="background">
      <SectionHeading title="ماذا ستكتسب؟" sub="ليست معلومات تُنسى، بل تغييرٌ تعيشه في علاقتك." />
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {items.map((p, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface px-5 py-4"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <Check className="size-4" />
            </span>
            <span className="text-foreground">{p}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
