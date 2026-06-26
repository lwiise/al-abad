import Image from "next/image";
import Link from "next/link";
import type { BlogPostRow } from "@/lib/database.types";
import { MediaFallback } from "./media-fallback";

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export function PostCard({ post, index = 0 }: { post: BlogPostRow; index?: number }) {
  const date = formatDate(post.published_at);

  return (
    <Link
      href={`/المدونة/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MediaFallback title={post.title} seed={index} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {date && <span className="text-xs text-foreground-subtle">{date}</span>}
        <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground-muted">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
