import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Styled markdown for course descriptions, blog bodies and about copy. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 leading-loose text-foreground-muted",
        "[&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground",
        "[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground",
        "[&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground",
        "[&_a]:text-primary [&_a]:underline [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:pe-6 [&_ol]:list-decimal [&_ol]:pe-6 [&_li]:my-1",
        "[&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-4 [&_blockquote]:text-foreground-subtle",
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
