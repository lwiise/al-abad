"use client";

import { useState } from "react";
import Image from "next/image";
import type { TestimonialRow } from "@/lib/database.types";

const LIMIT = 180;

export function TestimonialCard({ t }: { t: TestimonialRow }) {
  const [open, setOpen] = useState(false);
  const long = t.quote.length > LIMIT;
  const text = open || !long ? t.quote : t.quote.slice(0, LIMIT).trim() + "…";

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm">
      <blockquote className="flex-1 leading-loose text-foreground">{text}</blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 self-start text-sm font-medium text-primary hover:text-primary-hover"
        >
          {open ? "عرض أقل" : "اقرأ المزيد"}
        </button>
      )}
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-5">
        {t.avatar_url ? (
          <span className="relative size-11 overflow-hidden rounded-full">
            <Image src={t.avatar_url} alt={t.author_name} fill sizes="44px" className="object-cover" />
          </span>
        ) : (
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-strong font-bold text-primary">
            {t.author_name.trim().charAt(0)}
          </span>
        )}
        <div>
          <p className="font-bold text-foreground">{t.author_name}</p>
          {t.author_title && <p className="text-xs text-foreground-subtle">{t.author_title}</p>}
        </div>
      </figcaption>
    </figure>
  );
}
