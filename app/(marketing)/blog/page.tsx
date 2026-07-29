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
      {/* Reveal sits inside the header so the landmark stays a real <header>
          and the mb-12 keeps its own margin box — same shape as the courses
          masthead. */}
      <header className="mb-12 text-center">
        <Reveal>
          <h1 className="text-4xl font-extrabold text-foreground md:text-5xl">
            {settings?.blog_page_heading || "المدونة"}
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">
            {settings?.blog_page_subhead || "مقالاتٌ تثري وعيك حول العلاقة الزوجية."}
          </p>
        </Reveal>
      </header>

      {/* The empty state stays bare, as it does on the courses page: a notice
          that only ever appears when the page has nothing on it does not need
          an entrance. */}
      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-foreground-muted">
          لا توجد مقالات منشورة حالياً.
        </p>
      ) : (
        /* Stagger replaces the grid div rather than wrapping it — same grid,
           no extra node. This is the same band BlogTeaser renders on the home
           page, which has always been staggered; the two should not differ. */
        <Stagger className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </Stagger>
      )}
    </div>
  );
}
