import { cn } from "@/lib/utils";
import { QuoteMark } from "@/components/ui/quote-mark";
import { Reveal } from "@/components/motion/reveal";

/** A single strong line lifted from the body, set large in brand color. */
export function PullQuote({ text, className }: { text: string; className?: string }) {
  return (
    <Reveal className={cn("my-12", className)}>
      <figure className="mx-auto max-w-2xl text-center">
        <QuoteMark className="mx-auto mb-1" />
        <blockquote className="text-2xl font-bold leading-relaxed text-primary md:text-[1.75rem]">
          {text}
        </blockquote>
      </figure>
    </Reveal>
  );
}
