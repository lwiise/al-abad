import { cn } from "@/lib/utils";

type Tone = "lilac" | "coral" | "violet" | "plum";

const TONES: Record<Tone, { stroke: string; text: string }> = {
  lilac: { stroke: "stroke-surface-strong", text: "fill-primary" },
  coral: { stroke: "stroke-accent", text: "fill-white" },
  violet: { stroke: "stroke-highlight", text: "fill-white" },
  plum: { stroke: "stroke-primary", text: "fill-white" },
};

/**
 * Signature flowing ribbon: a brand-tone band along a soft S-curve, carrying a
 * short repeated Arabic phrase on an SVG textPath. Purely decorative
 * (aria-hidden). `decorativeOnly` drops the text if shaping ever looks off.
 * `id` must be unique per instance (used for the path reference).
 */
export function Ribbon({
  id,
  text,
  tone = "lilac",
  decorativeOnly = false,
  repeat = 4,
  className,
}: {
  id: string;
  text: string;
  tone?: Tone;
  decorativeOnly?: boolean;
  repeat?: number;
  className?: string;
}) {
  const t = TONES[tone];
  const phrase = Array(repeat).fill(text).join("      •      ");
  const pathId = `ribbon-${id}`;

  return (
    <svg
      viewBox="0 0 1200 120"
      className={cn("pointer-events-none w-full select-none", className)}
      aria-hidden="true"
    >
      <defs>
        <path id={pathId} d="M-20,82 C220,20 430,30 620,60 S980,112 1220,40" fill="none" />
      </defs>
      <use href={`#${pathId}`} className={t.stroke} strokeWidth={42} strokeLinecap="round" />
      {!decorativeOnly && (
        <text className={cn("font-display text-[22px] font-bold", t.text)} dy="7">
          <textPath href={`#${pathId}`} startOffset="2%">
            {phrase}
          </textPath>
        </text>
      )}
    </svg>
  );
}
