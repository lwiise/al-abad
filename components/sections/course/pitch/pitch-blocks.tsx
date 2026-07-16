import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { PitchNode } from "../parse-pitch";
import { PitchCardGrid } from "./pitch-card-grid";
import { PullQuote } from "./pull-quote";
import { Callout } from "./callout";

/**
 * Renders a run of non-heading pitch nodes — the shared body vocabulary used
 * by every subsection: prose, callouts, quotes, card grids. `cardIcons` gives
 * fully-labelled feature runs (the "ماذا ستكتسب" gains) varied icons; plain
 * checklists keep the check and ordered lists keep their numbers.
 */
export function PitchBlocks({ nodes, cardIcons }: { nodes: PitchNode[]; cardIcons?: LucideIcon[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        const key = `${i}-${n.type}`;

        if (n.type === "quote") return <PullQuote key={key} text={n.text} />;
        if (n.type === "callout") return <Callout key={key} text={n.text} />;

        if (n.type === "cards") {
          const iconSet =
            cardIcons && !n.ordered && n.items.every((it) => it.label) ? cardIcons : undefined;
          return <PitchCardGrid key={key} items={n.items} ordered={n.ordered} iconSet={iconSet} />;
        }

        if (n.type === "heading") {
          // Cannot occur after grouping — render harmlessly as a sub-heading.
          return (
            <Reveal key={key} className="mx-auto mt-10 max-w-2xl text-center">
              <h3 className="text-xl font-bold text-foreground">{n.text}</h3>
            </Reveal>
          );
        }

        return (
          <Reveal key={key} className="mx-auto mt-6 max-w-[65ch]">
            <p className="text-center text-lg leading-loose text-foreground-muted">{n.text}</p>
          </Reveal>
        );
      })}
    </>
  );
}
