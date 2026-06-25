import ReactMarkdown from "react-markdown";
import { Plus } from "lucide-react";
import type { FaqRow } from "@/lib/database.types";
import { Section, SectionHeading } from "./section";

export function Faq({ faqs }: { faqs: FaqRow[] }) {
  if (faqs.length === 0) return null;

  return (
    <Section bg="background">
      <SectionHeading title="الأسئلة الشائعة" />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {faqs.map((f) => (
          <details key={f.id} className="group bg-background open:bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {f.question}
              <Plus className="size-5 shrink-0 text-foreground-subtle transition-transform group-open:rotate-45" />
            </summary>
            {f.answer && (
              <div className="px-6 pb-6 leading-loose text-foreground-muted [&_a]:text-primary [&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-3 [&_ul]:list-disc [&_ul]:pe-5">
                <ReactMarkdown>{f.answer}</ReactMarkdown>
              </div>
            )}
          </details>
        ))}
      </div>
    </Section>
  );
}
