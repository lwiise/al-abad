import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import type { BlogPostRow } from "@/lib/database.types";
import { Section, SectionHeading } from "./section";
import { PostCard } from "./post-card";

export function BlogTeaser({ posts }: { posts: BlogPostRow[] }) {
  if (posts.length === 0) return null;

  return (
    <Section bg="surface">
      <SectionHeading title="أحدث المقالات" sub="مقالاتٌ تثري وعيك حول العلاقة الزوجية." />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/المدونة" className={buttonClasses("outline", "md")}>
          عرض جميع المقالات
        </Link>
      </div>
    </Section>
  );
}
