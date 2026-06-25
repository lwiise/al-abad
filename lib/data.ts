import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  BlogPostRow,
  CourseRow,
  FaqRow,
  HowItWorksStepRow,
  SiteSettingsRow,
  StatRow,
  TestimonialRow,
  Json,
} from "@/lib/database.types";

/**
 * Public read layer for the marketing site. Uses the anon server client, so
 * every query is RLS-scoped (only published rows / public settings come back).
 * Each reader is React-cache()'d so the layout and page share one round-trip.
 */

export const getSettings = cache(async (): Promise<SiteSettingsRow | null> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return data ?? null;
});

export const getPublishedCourses = cache(async (): Promise<CourseRow[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getCourseBySlug = cache(async (slug: string): Promise<CourseRow | null> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ?? null;
});

export const getCourseCategories = cache(async (): Promise<string[]> => {
  const courses = await getPublishedCourses();
  const seen = new Set<string>();
  for (const c of courses) {
    if (c.category && c.category.trim()) seen.add(c.category.trim());
  }
  return [...seen];
});

export const getPublishedTestimonials = cache(async (): Promise<TestimonialRow[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getPublishedFaqs = cache(async (): Promise<FaqRow[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getPublishedStats = cache(async (): Promise<StatRow[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("stats")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getPublishedSteps = cache(async (): Promise<HowItWorksStepRow[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("how_it_works_steps")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getPublishedPosts = cache(async (limit?: number): Promise<BlogPostRow[]> => {
  const supabase = createPublicClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data ?? [];
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPostRow | null> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ?? null;
});

// --- helpers ---------------------------------------------------------------

/** Coerce a jsonb field (ai_points / problem_points / outcome_points) to string[]. */
export function asList(value: Json | null | undefined): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

/** Build a wa.me link from a stored WhatsApp number (strips non-digits). */
export function waLink(number?: string | null, text?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
