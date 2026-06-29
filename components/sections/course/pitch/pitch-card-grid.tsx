import {
  Target,
  Compass,
  Brain,
  ShieldCheck,
  Sparkles,
  Layers,
  Lightbulb,
  Heart,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Stagger } from "@/components/motion/stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import type { PitchItem } from "../parse-pitch";

const ICONS = [Target, Compass, Brain, ShieldCheck, Lightbulb, Layers, Gauge, Heart, CheckCircle2, Sparkles];
const GRADIENTS = ["from-plum to-teal", "from-teal to-plum", "from-plum to-violet", "from-secondary to-plum"];

/** A detected list/feature run → a staggered grid of icon cards. */
export function PitchCardGrid({ items, ordered = false }: { items: PitchItem[]; ordered?: boolean }) {
  return (
    <Stagger as="ul" preset="flip" className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
      {items.map((it, i) => {
        const Icon = ICONS[i % ICONS.length];
        const grad = GRADIENTS[i % GRADIENTS.length];
        return (
          <TiltCard
            as="li"
            key={`${i}-${it.text.slice(0, 16)}`}
            className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6"
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
                grad,
              )}
            >
              {ordered ? (
                <span className="text-base font-extrabold tabular-nums">{i + 1}</span>
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
            </span>

            {it.label ? (
              <>
                <h4 className="mt-4 font-bold text-foreground">{it.label}</h4>
                <p className="mt-1.5 leading-relaxed text-foreground-muted">{it.text}</p>
              </>
            ) : (
              <p className="mt-4 font-medium leading-relaxed text-foreground">{it.text}</p>
            )}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full bg-violet/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-80"
            />
          </TiltCard>
        );
      })}
    </Stagger>
  );
}
