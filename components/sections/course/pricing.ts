import type { CourseRow } from "@/lib/database.types";

/** "190 ر.س" for SAR, otherwise "190 <currency>". */
export function formatPrice(amount: number, currency?: string | null): string {
  const n = Number(amount).toLocaleString("en-US");
  return (currency ?? "SAR") === "SAR" ? `${n} ر.س` : `${n} ${currency}`;
}

/** Normalized price fields for a course: the anchor + computed discount. */
export function priceParts(course: CourseRow) {
  const price = course.price;
  const original = course.price_original;
  const currency = course.currency ?? "SAR";
  const hasAnchor = price != null && original != null && original > price;
  const discountPct =
    hasAnchor && price != null && original != null
      ? Math.round((1 - price / original) * 100)
      : 0;
  return { price, original, currency, hasAnchor, discountPct };
}
