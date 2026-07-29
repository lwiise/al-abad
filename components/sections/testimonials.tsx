import type { TestimonialRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Sequence } from "@/components/motion/sequence";
import { QuoteMark } from "@/components/ui/quote-mark";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Section } from "./section";
import { TestimonialCard } from "./testimonial-card";

export function Testimonials({
  testimonials,
  eyebrow,
  heading,
}: {
  testimonials: TestimonialRow[];
  eyebrow?: string | null;
  heading?: string | null;
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section bg="lilac" className="overflow-hidden">
      <Sequence>
        {/* decorative quote flourish */}
        <div data-seq-item>
          <QuoteMark className="mx-auto mb-4 text-center" />
        </div>

        {/* overlapping avatar cluster */}
        <div data-seq-item className="flex justify-center">
          <div className="flex flex-row-reverse">
            {testimonials.slice(0, 5).map((t, i) => (
              <Avatar
                key={t.id}
                className={cnRing(i)}
              >
                {t.avatar_url && <AvatarImage src={t.avatar_url} alt="" />}
                <AvatarFallback>{t.author_name.trim().charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p data-seq-item className="text-sm font-medium text-secondary">
            {eyebrow || "آراء المتدربين"}
          </p>
          <h2 data-seq-item className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {heading || "بعضٌ مما قاله الأحباب"}
          </h2>
        </div>
      </Sequence>

      {/* One Reveal, NOT a Sequence, and not per-slide either. Embla drives the
          track by transforming it, and the viewport clips on both axes — a
          per-slide rise would be cut off against that edge on the way up, and
          slides past the fold would animate where nobody can see them. The
          carousel is one object here; the header above is the composed part. */}
      <Reveal>
        <Carousel className="mt-12" opts={{ align: "start" }}>
          <CarouselContent>
            {testimonials.map((t, i) => (
              <CarouselItem key={t.id} className="lg:basis-1/2">
                <TestimonialCard t={t} featured={i === 0} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {testimonials.length > 1 && (
            <div className="mt-7 flex justify-center gap-3">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          )}
        </Carousel>
      </Reveal>
    </Section>
  );
}

// overlapping ring avatars (logical overlap in RTL via negative margin-inline-start)
function cnRing(i: number) {
  return [
    "size-12 ring-2 ring-surface",
    i > 0 ? "-ms-3" : "",
  ].join(" ");
}
