import { cn } from "@/lib/utils";

// Brand-tone gradient stand-ins for missing photography — varied by seed so a
// grid of cards never looks repetitive. Never a bare letter block.
const GRADIENTS = [
  "from-plum to-teal",
  "from-teal to-plum",
  "from-plum via-plum to-highlight",
  "from-ink to-plum",
  "from-secondary to-ink",
  "from-highlight to-plum",
];

export function MediaFallback({
  title,
  seed = 0,
  className,
}: {
  title: string;
  seed?: number;
  className?: string;
}) {
  const gradient = GRADIENTS[Math.abs(seed) % GRADIENTS.length];

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br p-6 text-center",
        gradient,
        className,
      )}
      aria-hidden="true"
    >
      {/* faint dotted texture for depth */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <span className="relative font-display text-lg font-bold leading-snug text-white/95 [text-wrap:balance] line-clamp-3">
        {title}
      </span>
    </div>
  );
}
