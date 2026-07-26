import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Split a CMS stat string into its animatable parts.
 * "+1000" → { prefix:"+", num:1000, suffix:"" }; non-numeric → { num:null }.
 *
 * `stats.value` is free text, so anything without a number (e.g. "قريباً")
 * must render verbatim rather than counting up from zero.
 */
export function splitStat(value: string) {
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!m) return { prefix: "", num: null as number | null, suffix: value };
  return { prefix: m[1].trim(), num: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3].trim() };
}
