import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import type { BlogPostRow } from "@/lib/database.types";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "./section";
import { PostCard } from "./post-card";

export function BlogTeaser({ posts }: { posts: BlogPostRow[] }) {
  if (posts.length === 0) return null;

  return (
    <Section bg="surface">
      <Reveal>
        <SectionHeading title="أحدث المقالات" sub="مقالاتٌ تثري وعيك حول العلاقة الزوجية." />
      </Reveal>
      <Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      </Reveal>
      <div className="mt-10 text-center">
        <Link href="/المدونة" className={cn(buttonClasses("outline", "md"), "rounded-full")}>
          عرض جميع المقالات
        </Link>
      </div>
    </Section>
  );
}
