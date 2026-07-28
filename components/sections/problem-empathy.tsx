import { Reveal } from "@/components/motion/reveal";
import { ChallengesBoard } from "./challenges-board";
import { Section } from "./section";

const FALLBACK = [
  "ضعف التواصل",
  "تكرار الخلافات",
  "حيرة الاختيار الزواجي",
  "فتور العلاقة",
  "القلق والضغوط الأسرية",
];

const HEADING = "هل تواجه أياً من هذه التحديات؟";
const LEDE =
  "معظم العلاقات لا تتعثّر لقلة الحب، بل لغياب الأدوات. أنت لست وحدك — وهذه نقطة البداية.";

export function ProblemEmpathy({
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
    <Section bg="lilac">
      {/* One entrance for the whole section — rise + fade on intersection,
          once. The diagram's own motion starts from there. */}
      <Reveal className="ch-reveal">
        <ChallengesBoard
          items={items}
          heading={heading || HEADING}
          lede={subhead || LEDE}
        />
      </Reveal>
    </Section>
  );
}
