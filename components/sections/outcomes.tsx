import { Reveal } from "@/components/motion/reveal";
import { OutcomesDeck } from "./outcomes-deck";
import { Section, SectionHeading } from "./section";

const FALLBACK = [
  "مهارات تواصل أعمق",
  "فهمٌ لدوافع السلوك",
  "أدوات عملية لحل الخلافات",
  "ثقة في قراراتك الزوجية",
];

export function Outcomes({
  points,
  heading,
  subhead,
}: {
  points: string[];
  heading?: string | null;
  subhead?: string | null;
}) {
  const items = points.length ? points : FALLBACK;

  return (
    <Section bg="background">
      <Reveal>
        <SectionHeading
          title={heading || "ماذا ستكتسب؟"}
          sub={subhead || "ليست معلومات تُنسى، بل تغييرٌ تعيشه في علاقتك."}
        />
      </Reveal>

      {/* Each outcome holds the screen on its own — see outcomes-deck.tsx.
          The 2 × 2 grid of icon cards it replaces gave each outcome a quarter
          of the attention and an icon from the same set as three other
          sections; none of the four said what it actually meant. */}
      <OutcomesDeck points={items} />
    </Section>
  );
}
