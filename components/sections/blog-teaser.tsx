import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { BlogPostRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Section, SectionHeading } from "./section";
import { PostCard } from "./post-card";

export function BlogTeaser({
  posts,
  heading,
  subhead,
  viewAllLabel,
}: {
  posts: BlogPostRow[];
  heading?: string | null;
  subhead?: string | null;
  viewAllLabel?: string | null;
}) {
  if (posts.length === 0) return null;

  return (
    <Section bg="surface">
      <Reveal>
        <SectionHeading
          title={heading || "أحدث المقالات"}
          sub={subhead || "مقالاتٌ تثري وعيك حول العلاقة الزوجية."}
        />
      </Reveal>
      <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} />
        ))}
      </Stagger>
      <div className="mt-10 text-center">
        <Link href="/المدونة" className={cn(buttonClasses("outline", "md"), "rounded-full")}>
          {viewAllLabel || "عرض جميع المقالات"}
        </Link>
      </div>
    </Section>
  );
}
