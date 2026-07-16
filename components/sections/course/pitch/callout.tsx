import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

/** A key insight lifted out of the prose into a colored highlight box. */
export function Callout({ text, className }: { text: string; className?: string }) {
  return (
    <Reveal className={cn("my-8", className)}>
      <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-2xl border-s-4 border-primary bg-surface-strong p-5 shadow-sm">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="font-medium leading-relaxed text-foreground">{text}</p>
      </div>
    </Reveal>
  );
}
