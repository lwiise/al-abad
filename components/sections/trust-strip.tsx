import type { StatRow } from "@/lib/database.types";
import { Section } from "./section";

export function TrustStrip({ stats }: { stats: StatRow[] }) {
  if (stats.length === 0) return null;

  return (
    <Section bg="background" className="!py-12">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.id} className="text-center">
            <p className="text-4xl font-extrabold text-primary md:text-5xl">{s.value}</p>
            <p className="mt-2 text-sm text-foreground-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
