import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "../section";
import { parsePitch, type PitchNode } from "./parse-pitch";
import { groupPitch } from "./group-pitch";
import { PitchCardGrid } from "./pitch/pitch-card-grid";
import { PullQuote } from "./pitch/pull-quote";
import { Callout } from "./pitch/callout";
import { PitchIntro } from "./pitch/pitch-intro";
import { PitchSubsection } from "./pitch/pitch-subsection";

/**
 * The pitch ("what is inside"): the body markdown parsed into blocks, then
 * grouped into the canonical landing structure — a surface intro band (hook +
 * lead prose + coach cutout) followed by heading-delimited subsections
 * ("ماذا ستكتسب…", "ما يميز…") on the page background. Content that doesn't
 * follow the template falls back to the flat block stream.
 */
export function CoursePitch({
  course,
  coachPhoto = "/coach.png",
}: {
  course: CourseRow;
  coachPhoto?: string;
}) {
  const nodes = parsePitch(course.description);
  if (nodes.length === 0) return null;

  const { hook, intro, sections } = groupPitch(nodes);
  if (sections.length === 0) return <FlatPitch nodes={nodes} />;

  const hasIntro = hook !== null || intro.length > 0;

  return (
    <section>
      {hasIntro && (
        <div className="relative isolate overflow-hidden bg-surface">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-16 start-[8%] size-72 rounded-full bg-highlight/10 blur-3xl" />
          </div>
          {/* no bottom padding: the coach cutout stands on the band's edge */}
          <div className="mx-auto max-w-6xl px-6 pt-14 md:pt-16">
            <PitchIntro hook={hook} nodes={intro} coachPhoto={coachPhoto} />
          </div>
        </div>
      )}

      <div className="relative isolate overflow-hidden bg-background">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 -start-32 size-72 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-16 -end-32 size-72 rounded-full bg-highlight/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          {sections.map((s, i) => (
            <PitchSubsection key={`${i}-${s.heading}`} heading={s.heading} nodes={s.nodes} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pre-template rendering: the flat block stream, kept as the safe fallback. */
function FlatPitch({ nodes }: { nodes: PitchNode[] }) {
  const firstHeadingIndex = nodes.findIndex((n) => n.type === "heading");

  return (
    <Section bg="surface">
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
