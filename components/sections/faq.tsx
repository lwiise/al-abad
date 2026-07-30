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
          {/* `shadow-sm`, because this is a white card on a WHITE band — 1.0:1,
              no ground step at all, the only card on the page with none. It was
              held by a #e6e1ee hairline alone, so on a wide screen the rounded
              corners were the sole hint that the questions were a surface
              rather than just an indented list.

              This is also the card CLAUDE.md's white-run note is about. That run
              was 8·9·10 and is 9·10 now — الآراء went to the `plum` band, so the
              الآراء → الأسئلة boundary is a 9.41:1 cut and no longer rests on a
              card edge at all. What the note still covers is 9 → 10, and the
              argument it makes there — "a card carries a border and a shadow and
              a band cannot" — is only true of this one because the shadow was
              added. Don't take it off. */}
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border bg-background px-5 shadow-sm"
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
