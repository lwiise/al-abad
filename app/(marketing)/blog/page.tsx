import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/data";
import { PostCard } from "@/components/sections/post-card";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات في الوعي الزواجي والأسري مع الأستاذ علي العباد.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">المدونة</h1>
        <p className="mt-4 text-lg text-foreground-muted">مقالاتٌ تثري وعيك حول العلاقة الزوجية.</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-foreground-muted">
          لا توجد مقالات منشورة حالياً.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
