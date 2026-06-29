"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getResource, type ResourceDef, type TableName } from "./resources";

/**
 * Generic, config-driven admin mutations. All run with the service-role client
 * (bypasses RLS) AFTER requireAdmin(). The client is treated as untyped here
 * because the table name is dynamic; payloads are built from the resource
 * field config, so they stay correct at runtime.
 */
function db(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}

// Revalidate the PUBLIC marketing routes affected by a content change so admin
// edits show up on the live site immediately (300s ISR is the fallback).
// Public routes live in English folders (Arabic URLs are rewritten to them in
// proxy.ts), so revalidate the ascii route paths.
const PUBLIC_PATHS: Record<string, string[]> = {
  courses: ["/", "/courses"],
  blog: ["/", "/blog"],
  testimonials: ["/"],
  faqs: ["/"],
  stats: ["/"],
  "how-it-works": ["/"],
};

function revalidatePublic(resourceKey: string, slug?: unknown) {
  for (const p of PUBLIC_PATHS[resourceKey] ?? []) revalidatePath(p);
  if (typeof slug === "string" && slug) {
    if (resourceKey === "courses") revalidatePath(`/courses/${slug}`);
    if (resourceKey === "blog") revalidatePath(`/blog/${slug}`);
  }
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const client = db();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from("media")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
  return client.storage.from("media").getPublicUrl(path).data.publicUrl;
}

async function nextSortOrder(client: SupabaseClient, table: TableName): Promise<number> {
  const { data } = await client
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.sort_order as number | undefined) ?? 0) + 1;
}

async function buildPayload(
  resource: ResourceDef,
  formData: FormData,
): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const raw = formData.get(field.name);
    switch (field.type) {
      case "boolean":
        payload[field.name] = raw === "on" || raw === "true";
        break;
      case "number": {
        const v = String(raw ?? "").trim();
        payload[field.name] = v === "" ? null : Number(v);
        break;
      }
      case "datetime": {
        const v = String(raw ?? "").trim();
        payload[field.name] = v === "" ? null : new Date(v).toISOString();
        break;
      }
      case "image": {
        const file = formData.get(`${field.name}__file`);
        if (file instanceof File && file.size > 0) {
          payload[field.name] = await uploadImage(file, resource.key);
        } else {
          const current = String(raw ?? "").trim();
          payload[field.name] = current === "" ? null : current;
        }
        break;
      }
      default: {
        const v = String(raw ?? "").trim();
        payload[field.name] = v === "" ? (field.required ? "" : null) : v;
      }
    }
  }
  return payload;
}

export async function saveResource(
  resourceKey: string,
  id: string | null,
  formData: FormData,
) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource) throw new Error(`Unknown resource: ${resourceKey}`);
  const client = db();
  const payload = await buildPayload(resource, formData);

  // Courses default currency.
  if (resource.table === "courses" && !payload.currency) payload.currency = "SAR";

  if (id) {
    const { error } = await client.from(resource.table).update(payload).eq("id", id);
    if (error) throw error;
  } else {
    if (resource.sortable) payload.sort_order = await nextSortOrder(client, resource.table);
    const { error } = await client.from(resource.table).insert(payload);
    if (error) throw error;
  }

  revalidatePath(`/admin/${resource.key}`);
  revalidatePath("/admin");
  revalidatePublic(resource.key, payload.slug);
  redirect(`/admin/${resource.key}`);
}

export async function deleteResource(resourceKey: string, id: string) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource) throw new Error(`Unknown resource: ${resourceKey}`);
  const { error } = await db().from(resource.table).delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/${resource.key}`);
  revalidatePath("/admin");
  revalidatePublic(resource.key);
}

export async function togglePublish(resourceKey: string, id: string, current: boolean) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource) throw new Error(`Unknown resource: ${resourceKey}`);
  const { error } = await db()
    .from(resource.table)
    .update({ is_published: !current })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/${resource.key}`);
  revalidatePublic(resource.key);
}

export async function reorderResource(
  resourceKey: string,
  id: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const resource = getResource(resourceKey);
  if (!resource || !resource.sortable) return;
  const client = db();
  const { data: rows } = await client
    .from(resource.table)
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];
  await client.from(resource.table).update({ sort_order: b.sort_order }).eq("id", a.id);
  await client.from(resource.table).update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath(`/admin/${resource.key}`);
  revalidatePublic(resource.key);
}

// ---------------------------------------------------------------------------
// Site settings (single row, bespoke form)
// ---------------------------------------------------------------------------
export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const client = db();

  const text = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const bool = (k: string) => formData.get(k) === "on";
  const list = (k: string) => {
    const arr = String(formData.get(k) ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length ? arr : null;
  };

  // hero image: uploaded file or existing url
  let heroImage = text("hero_image_url");
  const heroFile = formData.get("hero_image_url__file");
  if (heroFile instanceof File && heroFile.size > 0) {
    try {
      heroImage = await uploadImage(heroFile, "site");
    } catch (e) {
      console.error("hero image upload failed:", e);
      redirect(`/admin/settings?error=${encodeURIComponent("تعذّر رفع الصورة. جرّب صورة أصغر.")}`);
    }
  }

  // instructor (coach) image: uploaded file or existing url
  let instructorImage = text("instructor_image_url");
  const instructorFile = formData.get("instructor_image_url__file");
  if (instructorFile instanceof File && instructorFile.size > 0) {
    try {
      instructorImage = await uploadImage(instructorFile, "site");
    } catch (e) {
      console.error("instructor image upload failed:", e);
      redirect(`/admin/settings?error=${encodeURIComponent("تعذّر رفع الصورة. جرّب صورة أصغر.")}`);
    }
  }

  const socialEntries: Record<string, string> = {};
  for (const k of [
    "facebook",
    "tiktok",
    "snapchat",
    "telegram",
    "youtube",
    "twitter",
    "instagram",
  ]) {
    const v = text(`social_${k}`);
    if (v) socialEntries[k] = v;
  }

  const payload: Record<string, unknown> = {
    promo_enabled: bool("promo_enabled"),
    promo_bar_text: text("promo_bar_text"),
    promo_code: text("promo_code"),
    hero_headline: text("hero_headline"),
    hero_subhead: text("hero_subhead"),
    hero_image_url: heroImage,
    hero_primary_cta_label: text("hero_primary_cta_label"),
    hero_primary_cta_url: text("hero_primary_cta_url"),
    hero_secondary_cta_label: text("hero_secondary_cta_label"),
    hero_secondary_cta_url: text("hero_secondary_cta_url"),
    hero_microproof: text("hero_microproof"),
    ai_headline: text("ai_headline"),
    ai_subhead: text("ai_subhead"),
    ai_points: list("ai_points"),
    problem_points: list("problem_points"),
    outcome_points: list("outcome_points"),
    vision_text: text("vision_text"),
    vision_cta_label: text("vision_cta_label"),
    vision_cta_url: text("vision_cta_url"),
    final_cta_heading: text("final_cta_heading"),
    final_cta_primary_label: text("final_cta_primary_label"),
    final_cta_primary_url: text("final_cta_primary_url"),
    final_cta_secondary_label: text("final_cta_secondary_label"),
    final_cta_secondary_url: text("final_cta_secondary_url"),
    about_body: text("about_body"),
    whatsapp_number: text("whatsapp_number"),
    contact_email: text("contact_email"),
    social_links: Object.keys(socialEntries).length ? socialEntries : null,
    // homepage section labels
    hero_trust_badge: text("hero_trust_badge"),
    problem_heading: text("problem_heading"),
    problem_subhead: text("problem_subhead"),
    instructor_eyebrow: text("instructor_eyebrow"),
    instructor_name: text("instructor_name"),
    instructor_image_url: instructorImage,
    instructor_markers: list("instructor_markers"),
    instructor_cta_label: text("instructor_cta_label"),
    courses_eyebrow: text("courses_eyebrow"),
    courses_heading: text("courses_heading"),
    courses_subhead: text("courses_subhead"),
    courses_view_all_label: text("courses_view_all_label"),
    how_heading: text("how_heading"),
    how_subhead: text("how_subhead"),
    outcomes_heading: text("outcomes_heading"),
    outcomes_subhead: text("outcomes_subhead"),
    ai_badge: text("ai_badge"),
    testimonials_eyebrow: text("testimonials_eyebrow"),
    testimonials_heading: text("testimonials_heading"),
    faq_eyebrow: text("faq_eyebrow"),
    faq_heading: text("faq_heading"),
    faq_help_text: text("faq_help_text"),
    faq_help_cta_label: text("faq_help_cta_label"),
    blog_heading: text("blog_heading"),
    blog_subhead: text("blog_subhead"),
    blog_view_all_label: text("blog_view_all_label"),
  };

  try {
    const { data: existing } = await client.from("site_settings").select("id").limit(1).maybeSingle();
    if (existing?.id) {
      const { error } = await client.from("site_settings").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await client.from("site_settings").insert(payload);
      if (error) throw error;
    }
  } catch (e) {
    console.error("saveSettings failed:", e);
    const msg = e instanceof Error ? e.message : "تعذّر حفظ الإعدادات";
    redirect(`/admin/settings?error=${encodeURIComponent(msg.slice(0, 200))}`);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // settings drive header/footer/promo site-wide
  redirect("/admin/settings?saved=1");
}

export async function deleteWaitlistEntry(id: string) {
  await requireAdmin();
  const { error } = await db().from("ai_waitlist").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/waitlist");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
