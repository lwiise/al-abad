import { MessagesSquare, Brain, Wrench, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { Section, SectionHeading } from "./section";

const FALLBACK = [
  "مهارات تواصل أعمق",
  "فهمٌ لدوافع السلوك",
  "أدوات عملية لحل الخلافات",
  "ثقة في قراراتك الزوجية",
];

const ICONS = [MessagesSquare, Brain, Wrench, ShieldCheck];

export function Outcomes({ points }: { points: string[] }) {
  const items = points.length ? points : FALLBACK;

  return (
    <Section bg="background">
      <Reveal>
        <SectionHeading title="ماذا ستكتسب؟" sub="ليست معلومات تُنسى، بل تغييرٌ تعيشه في علاقتك." />
      </Reveal>
      <Stagger as="ul" preset="flip" className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {items.map((p, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <TiltCard
              as="li"
              key={i}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-sm"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal to-plum text-white shadow-md">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{p}</h3>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-violet/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
              />
            </TiltCard>
          );
        })}
      </Stagger>
    </Section>
  );
}
