import { cn } from "@/lib/utils";

type Tone = "published" | "draft" | "highlight" | "neutral";

const tones: Record<Tone, string> = {
  published: "bg-secondary/10 text-secondary",
  draft: "bg-neutral-200 text-foreground-muted",
  highlight: "bg-highlight/10 text-highlight",
  neutral: "bg-surface-strong text-primary",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
