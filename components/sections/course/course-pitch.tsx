import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "../section";
import { parsePitch } from "./parse-pitch";
import { PitchCardGrid } from "./pitch/pitch-card-grid";
import { PullQuote } from "./pitch/pull-quote";
import { Callout } from "./pitch/callout";

/**
 * The pitch ("what is inside"): the body markdown, transformed into visual blocks
 * — hook + pull-quote, list/feature runs → icon-card grids, callouts — so it
 * never reads as one uninterrupted column. Prose is constrained to ~65ch.
 */
export function CoursePitch({ course }: { course: CourseRow }) {
  const nodes = parsePitch(course.description);
  if (nodes.length === 0) return null;

  const firstHeadingIndex = nodes.findIndex((n) => n.type === "heading");

  return (
    <Section bg="background">
      {nodes.map((n, i) => {
        const key = `${i}-${n.type}`;

        if (n.type === "quote") return <PullQuote key={key} text={n.text} />;
        if (n.type === "callout") return <Callout key={key} text={n.text} />;

        if (n.type === "heading") {
          const isFirst = i === firstHeadingIndex;
          return (
            <Reveal key={key} className={cn("mx-auto max-w-2xl text-center", i === 0 ? "" : "mt-16")}>
              <h2
                className={cn(
                  "font-bold text-foreground",
                  isFirst ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
                )}
              >
                {n.text}
              </h2>
              <span
                className="mx-auto mt-4 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
                aria-hidden="true"
              />
            </Reveal>
          );
        }

        if (n.type === "cards") return <PitchCardGrid key={key} items={n.items} ordered={n.ordered} />;

        // paragraph — constrained measure
        return (
          <Reveal key={key} className="mx-auto mt-6 max-w-[65ch]">
            <p className="text-center text-lg leading-loose text-foreground-muted">{n.text}</p>
          </Reveal>
        );
      })}
    </Section>
  );
}
