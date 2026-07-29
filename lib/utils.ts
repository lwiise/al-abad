import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Split a headline at the ellipsis so the tail can be set apart typographically
 * (Ruqʿah calligraphy in the hero and the closing CTA).
 *
 * The `…` is the editor's marker, not ours: headlines are CMS copy, so nothing
 * here may hard-code the words, and guessing "the last two words" would break
 * the moment someone rewrites the line. No ellipsis means no tail — the
 * headline simply renders as one line.
 */
export function splitAtEllipsis(value: string): { lead: string; tail: string | null } {
  const i = value.indexOf("…");
  if (i === -1) return { lead: value, tail: null };
  return { lead: value.slice(0, i + 1).trim(), tail: value.slice(i + 1).trim() || null };
}
