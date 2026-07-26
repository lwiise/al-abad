import type { Metadata } from "next";
import { getPublishedPosts, getSettings } from "@/lib/data";
import { PostCard } from "@/components/sections/post-card";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات في الوعي الزواجي والأسري مع الأستاذ علي العباد.",
};

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSettings()]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Reveal>
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">
            {settings?.blog_page_heading || "المدونة"}
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">
            {settings?.blog_page_subhead || "مقالاتٌ تثري وعيك حول العلاقة الزوجية."}
          </p>
        </header>
      </Reveal>

      {posts.length === 0 ? (
        <Reveal>
          <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-foreground-muted">
            لا توجد مقالات منشورة حالياً.
          </p>
        </Reveal>
      ) : (
        <Stagger preset="depth" className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            // `index` seeds MediaFallback's gradient. Without it every
            // cover-less post rendered the identical block.
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </Stagger>
      )}
    </div>
  );
}
