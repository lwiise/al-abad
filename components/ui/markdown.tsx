import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Stagger } from "@/components/motion/stagger";

const PROSE =
  "space-y-4 leading-loose text-foreground-muted " +
  "[&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground " +
  "[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground " +
  "[&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground " +
  "[&_a]:text-primary [&_a]:underline [&_strong]:text-foreground " +
  "[&_ul]:list-disc [&_ul]:pe-6 [&_ol]:list-decimal [&_ol]:pe-6 [&_li]:my-1 " +
  "[&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-4 [&_blockquote]:text-foreground-subtle";

/**
 * Styled markdown for course descriptions, blog bodies and about copy.
 *
 * `stagger` cascades the paragraphs in as the block scrolls into view, instead
 * of landing the whole article at once — long Arabic prose arriving as a single
 * slab is a big part of what made the reading pages feel inert.
 *
 * It has to be applied *here* rather than by wrapping `<Markdown>` in
 * `<Stagger>` at the call site: `Stagger` sets its per-child delay on
 * `el.children`, which from the outside is this one wrapper div, not the
 * paragraphs inside it. Rendering `Stagger` *as* the prose wrapper puts
 * `data-stagger` on the real parent of the p/h2/ul nodes, so the existing
 * `[data-stagger="shown"] > *` rule cascades them with no new CSS.
 */
export function Markdown({
  children,
  className,
  stagger = false,
}: {
  children: string;
  className?: string;
  stagger?: boolean;
}) {
  if (stagger) {
    return (
      <Stagger amount={0.08} className={cn(PROSE, className)}>
        <ReactMarkdown>{children}</ReactMarkdown>
      </Stagger>
    );
  }

  return (
    <div className={cn(PROSE, className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
