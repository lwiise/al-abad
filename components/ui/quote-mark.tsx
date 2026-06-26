import { cn } from "@/lib/utils";

/**
 * Decorative opening-quote flourish (testimonials). A large display-face quote
 * glyph filled with the brand plum→teal gradient — matches the section-heading
 * underline. Purely decorative (aria-hidden); `dir="ltr"` keeps the glyph
 * canonical under the page's RTL root.
 */
export function QuoteMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      dir="ltr"
      className={cn(
        "block select-none font-display font-bold leading-none",
        "bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent",
        "text-7xl md:text-8xl",
        className,
      )}
    >
      &ldquo;
    </span>
  );
}
