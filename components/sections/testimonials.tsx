import type { TestimonialRow } from "@/lib/database.types";
import { Section, SectionHeading } from "./section";
import { TestimonialCard } from "./testimonial-card";

export function Testimonials({ testimonials }: { testimonials: TestimonialRow[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Section bg="surface">
      <SectionHeading eyebrow="آراء المتدربين" title="بعضٌ مما قاله الأحباب" />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    </Section>
  );
}
