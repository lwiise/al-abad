"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TestimonialRow } from "@/lib/database.types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const LIMIT = 200;

export function TestimonialCard({ t, featured = false }: { t: TestimonialRow; featured?: boolean }) {
  const [open, setOpen] = useState(false);
  const long = t.quote.length > LIMIT;
  const text = open || !long ? t.quote : t.quote.slice(0, LIMIT).trim() + "…";

  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-3xl border p-7 shadow-sm",
        featured ? "dark-depth border-transparent bg-ink text-white" : "border-border bg-background",
      )}
    >
      <blockquote className={cn("flex-1 leading-loose", featured ? "text-white/90" : "text-foreground")}>
        {text}
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "mt-3 self-start text-sm font-medium",
            featured ? "text-lilac hover:text-white" : "text-primary hover:text-primary-hover",
          )}
        >
          {open ? "عرض أقل" : "اقرأ المزيد"}
        </button>
      )}
      <figcaption
        className={cn(
          "mt-6 flex items-center gap-3 border-t pt-5",
          featured ? "border-white/15" : "border-border",
        )}
      >
        <Avatar className="size-11">
          {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.author_name} />}
          <AvatarFallback>{t.author_name.trim().charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className={cn("font-bold", featured ? "text-white" : "text-foreground")}>{t.author_name}</p>
          {t.author_title && (
            <p className={cn("text-xs", featured ? "text-white/60" : "text-foreground-subtle")}>
              {t.author_title}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
