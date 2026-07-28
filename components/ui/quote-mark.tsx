import { cn } from "@/lib/utils";

/**
 * Decorative opening-quote flourish (testimonials). A large display-face quote
 * glyph in flat plum — matches the section-heading rule, which is also flat.
 * It used to be filled with a plum→teal gradient via `bg-clip-text`; that
 * gradient was the site's generic-template tic and is gone everywhere now.
 * Purely decorative (aria-hidden); `dir="ltr"` keeps the glyph canonical under
 * the page's RTL root.
 */
export function QuoteMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      dir="ltr"
      className={cn(
        "block select-none font-display font-bold leading-none",
        "text-primary/25",
        "text-7xl md:text-8xl",
        className,
      )}
    >
      &ldquo;
    </span>
  );
}
