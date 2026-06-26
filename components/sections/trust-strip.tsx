import type { StatRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "./section";

export function TrustStrip({ stats }: { stats: StatRow[] }) {
  if (stats.length === 0) return null;

  return (
    <Section bg="background" className="!py-10">
      <Reveal>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="bg-background p-6 text-center">
              <p className="text-4xl font-extrabold tabular-nums text-primary md:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-foreground-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
