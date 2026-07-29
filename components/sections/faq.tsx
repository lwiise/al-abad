import Link from "next/link";
import type { FaqRow } from "@/lib/database.types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Markdown } from "@/components/ui/markdown";
import { Sequence } from "@/components/motion/sequence";
import { Section } from "./section";

export function Faq({
  faqs,
  eyebrow,
  heading,
  helpText,
  helpCtaLabel,
}: {
  faqs: FaqRow[];
  eyebrow?: string | null;
  heading?: string | null;
  helpText?: string | null;
  helpCtaLabel?: string | null;
}) {
  if (faqs.length === 0) return null;

  return (
    <Section bg="background">
      {/* One observer for both columns, so the questions cascade out of the
          heading instead of the two halves arriving as separate slabs. The
          sticky column is marked as a single item — the questions are the list,
          and cascading the heading's own three lines as well would double the
          motion in one glance. */}
      <Sequence className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div data-seq-item className="lg:sticky lg:top-24">
            <p className="text-sm font-medium text-secondary">{eyebrow || "الأسئلة الشائعة"}</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              {heading || "إجاباتٌ عن أكثر ما يُسأل"}
            </h2>
            <p className="mt-4 text-foreground-muted">
              {helpText || "لم تجد إجابتك؟"}{" "}
              <Link href="/تواصل" className="font-medium text-primary hover:text-primary-hover">
                {helpCtaLabel || "تواصل معنا"}
              </Link>
              .
            </p>
          </div>
        </div>

        <div>
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border bg-background px-5"
          >
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} data-seq-item>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                {f.answer && (
                  <AccordionContent>
                    <div className="[&_a]:text-primary [&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-3 [&_ul]:list-disc [&_ul]:pe-5">
                      <Markdown>{f.answer}</Markdown>
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Sequence>
    </Section>
  );
}
