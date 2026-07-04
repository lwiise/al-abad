import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stagger } from "@/components/motion/stagger";
import type { PitchItem } from "../parse-pitch";

/**
 * A detected list/feature run → a calm grid of cards. One consistent hover
 * (subtle 2D lift + shadow) shared with every card on the page; a single quiet
 * badge — number for ordered lists, a rotating icon when `iconSet` is given
 * (labelled feature cards), a check otherwise — no gradient/glow noise.
 */
export function PitchCardGrid({
  items,
  ordered = false,
  iconSet,
}: {
  items: PitchItem[];
  ordered?: boolean;
  iconSet?: LucideIcon[];
}) {
  return (
    <Stagger as="ul" preset="rise" className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
      {items.map((it, i) => {
        const Icon = iconSet ? iconSet[i % iconSet.length] : null;
        return (
          <li
            key={`${i}-${it.text.slice(0, 16)}`}
            className="transform-gpu rounded-2xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums",
                  Icon && i % 2 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary",
                )}
              >
                {ordered ? (
                  i + 1
                ) : Icon ? (
                  <Icon className="size-5" aria-hidden="true" />
                ) : (
                  <Check className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                {it.label && <h4 className="font-bold text-foreground">{it.label}</h4>}
                <p className={cn("leading-relaxed", it.label ? "mt-1 text-foreground-muted" : "font-medium text-foreground")}>
                  {it.text}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </Stagger>
  );
}
