import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Split CMS copy at the first ellipsis so the tail can be styled differently.
 *
 * Two callers, two treatments: the hero sets its tail in Ruqʿah, section 7 sets
 * its tail in violet. Neither may hard-code the tail — the headline is CMS copy
 * and an editor can change it. No ellipsis means no second line.
 */
export function splitAtEllipsis(value: string): { lead: string; tail: string | null } {
  const i = value.indexOf("…");
  if (i === -1) return { lead: value, tail: null };
  return { lead: value.slice(0, i + 1).trim(), tail: value.slice(i + 1).trim() || null };
}
