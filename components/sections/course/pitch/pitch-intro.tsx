import Image from "next/image";
import { BookOpenCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { PitchNode } from "../parse-pitch";
import { Callout } from "./callout";
import { PitchCardGrid } from "./pitch-card-grid";

/**
 * The pitch opener: hook headline + lead prose on the start side, the coach
 * cutout (meet-instructor halo pattern) on the end side, grounded on the
 * band's bottom edge — the surrounding band supplies no bottom padding.
 */
export function PitchIntro({
  hook,
  nodes,
  coachPhoto,
}: {
  hook: string | null;
  nodes: PitchNode[];
  coachPhoto: string;
}) {
  // Without a `# hook`, a leading pull-quote takes the headline slot.
  let prose = nodes;
  let headline = hook;
  if (!headline && prose[0]?.type === "quote") {
    headline = prose[0].text;
    prose = prose.slice(1);
  }
  const columnNodes = prose.filter((n) => n.type !== "cards");
  const cardNodes = prose.filter((n) => n.type === "cards");

  return (
    <>
      <div className="grid items-end gap-x-16 gap-y-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="pb-4 text-start lg:pb-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm">
            <BookOpenCheck className="size-4 text-secondary" aria-hidden="true" />
            لماذا هذه الدورة؟
          </p>
          {headline && (
            <h2 className="mt-5 text-3xl font-bold leading-snug text-foreground [text-wrap:balance] md:text-4xl">
              {headline}
            </h2>
          )}
          <span
            className="mt-4 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
            aria-hidden="true"
          />
          {columnNodes.map((n, i) => {
            const key = `${i}-${n.type}`;
            if (n.type === "callout") return <Callout key={key} text={n.text} className="my-6" />;
            if (n.type === "quote" || n.type === "heading") {
              return (
                <p key={key} className="mt-5 text-xl font-bold leading-relaxed text-primary">
                  {n.text}
                </p>
              );
            }
            if (n.type === "para") {
              return (
                <p key={key} className="mt-5 text-lg leading-loose text-foreground-muted">
                  {n.text}
                </p>
              );
            }
            return null;
          })}
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-[280px] sm:max-w-sm">
          <div className="relative aspect-[4/5]">
            {/* soft brand halo behind the cutout so it blends into the band (no frame) */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-6 -z-10 rounded-[100%] bg-gradient-to-b from-highlight/25 via-highlight/10 to-transparent blur-3xl"
            />
            <div aria-hidden="true" className="absolute -top-2 end-3 -z-10 size-28 rounded-3xl bg-secondary/15" />
            <div aria-hidden="true" className="absolute bottom-12 -start-6 -z-10 size-20 rounded-2xl bg-primary/10" />
            <Image
              src={coachPhoto}
              alt="الأستاذ علي العباد"
              fill
              sizes="(max-width: 640px) 280px, 384px"
              className="object-contain object-bottom"
            />
          </div>
        </Reveal>
      </div>

      {/* Card runs are unexpected in the intro — render them full-width below the split. */}
      {cardNodes.length > 0 && (
        <div className="pb-12">
          {cardNodes.map((n, i) =>
            n.type === "cards" ? <PitchCardGrid key={i} items={n.items} ordered={n.ordered} /> : null,
          )}
        </div>
      )}
    </>
  );
}
