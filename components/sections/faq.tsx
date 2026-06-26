import Link from "next/link";
import type { FaqRow } from "@/lib/database.types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/motion/reveal";
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
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <div className="lg:sticky lg:top-24">
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
        </Reveal>

        <Reveal>
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border bg-background px-5"
          >
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
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
        </Reveal>
      </div>
    </Section>
  );
}
