import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/data";
import { Markdown } from "@/components/ui/markdown";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "المقال غير موجود" };
  return { title: post.title, description: post.excerpt ?? undefined };
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const date = formatDate(post.published_at);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <Link
        href="/المدونة"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" /> كل المقالات
      </Link>

      {date && <p className="text-sm text-foreground-subtle">{date}</p>}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
        {post.title}
      </h1>

      {post.cover_image_url && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-border">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8">{post.body && <Markdown>{post.body}</Markdown>}</div>
    </article>
  );
}
