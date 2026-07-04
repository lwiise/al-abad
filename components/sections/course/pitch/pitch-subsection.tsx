import {
  Compass,
  Gem,
  HeartHandshake,
  Lightbulb,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import type { PitchNode } from "../parse-pitch";
import { PitchBlocks } from "./pitch-blocks";

const CHIP_ICONS: LucideIcon[] = [Target, Gem, Compass, Lightbulb];
const CARD_ICONS: LucideIcon[] = [Lightbulb, Target, HeartHandshake, Compass, TrendingUp, Gem];

/**
 * One heading-delimited pitch subsection ("ماذا ستكتسب من هذه الدورة؟",
 * "ما يميز هذه الدورة؟", …): a centered icon chip + heading + gradient
 * underline, then the section's blocks.
 */
export function PitchSubsection({
  heading,
  nodes,
  index,
}: {
  heading: string;
  nodes: PitchNode[];
  index: number;
}) {
  const Chip = CHIP_ICONS[index % CHIP_ICONS.length];
  return (
    <div className={cn(index > 0 && "mt-20")}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <span
          className={cn(
            "mx-auto flex size-12 items-center justify-center rounded-2xl",
            index % 2 ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary",
          )}
          aria-hidden="true"
        >
          <Chip className="size-6" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">{heading}</h2>
        <span
          className="mx-auto mt-4 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
          aria-hidden="true"
        />
      </Reveal>
      <PitchBlocks nodes={nodes} cardIcons={CARD_ICONS} />
    </div>
  );
}
