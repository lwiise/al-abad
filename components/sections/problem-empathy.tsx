import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "./section";

const FALLBACK = [
  "ضعف التواصل",
  "تكرار الخلافات",
  "حيرة الاختيار الزواجي",
  "فتور العلاقة",
  "القلق والضغوط الأسرية",
];

export function ProblemEmpathy({ points }: { points: string[] }) {
  const items = points.length ? points : FALLBACK;

  return (
    <Section bg="surface">
      <Reveal>
        <SectionHeading
          title="هل تواجه أياً من هذه التحديات؟"
          sub="معظم العلاقات لا تتعثّر لقلة الحب، بل لغياب الأدوات. أنت لست وحدك — وهذه نقطة البداية."
        />
      </Reveal>
      <Reveal>
        <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
          {items.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 text-foreground transition-colors hover:border-border-strong"
            >
              <span className="size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
