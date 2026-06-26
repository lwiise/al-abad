import { MessagesSquare, Flame, Compass, HeartCrack, CloudRain } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { ConnectionArt } from "./art/connection-art";
import { Section, SectionHeading } from "./section";

const FALLBACK = [
  "ضعف التواصل",
  "تكرار الخلافات",
  "حيرة الاختيار الزواجي",
  "فتور العلاقة",
  "القلق والضغوط الأسرية",
];

const ICONS = [MessagesSquare, Flame, Compass, HeartCrack, CloudRain];

export function ProblemEmpathy({ points }: { points: string[] }) {
  const items = points.length ? points : FALLBACK;

  return (
    <Section bg="surface">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Text + pain-point cards */}
        <div>
          <Reveal>
            <SectionHeading
              align="start"
              title="هل تواجه أياً من هذه التحديات؟"
              sub="معظم العلاقات لا تتعثّر لقلة الحب، بل لغياب الأدوات. أنت لست وحدك — وهذه نقطة البداية."
            />
          </Reveal>
          <Stagger as="ul" preset="flip" className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((p, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <TiltCard
                  as="li"
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 text-foreground shadow-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-teal text-white shadow-sm">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium">{p}</span>
                </TiltCard>
              );
            })}
          </Stagger>
        </div>

        {/* Illustration */}
        <Reveal className="order-first lg:order-none">
          <div className="relative mx-auto max-w-md">
            <div className="aura absolute inset-0 -z-10 scale-125 opacity-60" />
            <ConnectionArt className="w-full" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
