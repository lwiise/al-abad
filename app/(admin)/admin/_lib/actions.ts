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

// ---------------------------------------------------------------------------
// Error reporting
// ---------------------------------------------------------------------------
// PostgREST hands back failures as PLAIN OBJECTS — { message, details, hint,
// code } — not Error instances. So `e instanceof Error` is false for every
// database failure in this file, and the ternary that guarded on it threw away
// the only useful part: the owner saw "تعذّر حفظ الإعدادات" no matter what had
// actually gone wrong. Anything that surfaces a Supabase failure goes through
// here instead.

type DbError = { message?: string; details?: string; hint?: string; code?: string };

function asDbError(e: unknown): DbError | null {
  return e && typeof e === "object" && "message" in e ? (e as DbError) : null;
}

/** `redirect()` / `notFound()` signal by throwing; never treat one as a failure. */
function rethrowControlFlow(e: unknown): void {
  const digest = (e as { digest?: unknown } | null)?.digest;
  if (typeof digest === "string" && /^NEXT_(REDIRECT|NOT_FOUND|HTTP_ERROR)/.test(digest)) {
    throw e;
  }
}

function describeDbError(e: unknown): string {
  if (e instanceof Error) return e.message;
  const err = asDbError(e);
  if (!err) return "خطأ غير معروف";
  return [err.message, err.hint, err.code && `(${err.code})`].filter(Boolean).join(" — ");
}

/** Log with context and rethrow as a real Error, so the message survives. */
function dbFail(context: string, e: unknown): never {
  rethrowControlFlow(e);
  console.error(`${context}:`, e);
  throw new Error(`${context}: ${describeDbError(e)}`);
}

/**
 * Name of the column a write failed on because the deployed database does not
 * have it — i.e. it is behind supabase/migrations. PostgREST reports this as
 * PGRST204 from its schema cache; Postgres itself reports 42703.
 */
function missingColumn(e: unknown): string | null {
  const err = asDbError(e);
  if (!err) return null;
  const message = err.message ?? "";
  if (err.code === "PGRST204" || /schema cache/i.test(message)) {
    return /'([^']+)' column/.exec(message)?.[1] ?? null;
  }
  if (err.code === "42703") {
    // Two wordings: `column site_settings.x does not exist` (select) and
    // `column "x" of relation "site_settings" does not exist` (insert/update).
    return (
      /column "?(?:[\w.]+\.)?([a-z_][a-z0-9_]*)"?(?:\s+of relation "?[\w.]+"?)? does not exist/i.exec(
        message,
      )?.[1] ?? null
    );
  }
  return null;
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
  if (error) dbFail(`رفع ${file.name}`, error);
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
    if (error) dbFail(`تعذّر تحديث ${resource.singular}`, error);
  } else {
    if (resource.sortable) payload.sort_order = await nextSortOrder(client, resource.table);
    const { error } = await client.from(resource.table).insert(payload);
    if (error) dbFail(`تعذّر إنشاء ${resource.singular}`, error);
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
  if (error) dbFail(`تعذّر حذف ${resource.singular}`, error);
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
  if (error) dbFail(`تعذّر تغيير حالة النشر لـ${resource.singular}`, error);
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
// Site settings (single row, edited via the per-page forms at /admin/pages/*)
// ---------------------------------------------------------------------------
export type SettingsPage = "home" | "about" | "blog" | "contact";

const SETTINGS_PAGES: SettingsPage[] = ["home", "about", "blog", "contact"];

// Bounded so a table that is missing everything fails fast instead of walking
// the payload one round-trip at a time.
const MAX_DROPPED_COLUMNS = 16;

/**
 * Write the single site_settings row, tolerating a database that is behind
 * supabase/migrations. Returns the columns that had to be dropped.
 *
 * PostgREST rejects the WHOLE row when it names a column the table lacks, so
 * one un-applied migration silently bricked an entire editor page — that is how
 * the الرئيسية editor stopped saving (full_setup.sql was missing 0005/0006).
 * The schema is repaired now, but the owner edits a live site: a future column
 * added ahead of its migration must cost that one field, not the save. Each
 * rejected column is dropped and the write retried, and the caller tells the
 * owner exactly which fields did not land.
 */
async function writeSettings(
  client: SupabaseClient,
  payload: Record<string, unknown>,
): Promise<string[]> {
  // Oldest row wins. site_settings is single-row by convention, not by
  // constraint, and the previous code inserted a fresh row whenever the read
  // came back empty — including when it came back empty because it errored.
  // Ordering makes reads and writes agree on which row is canonical even if a
  // duplicate already exists.
  const { data: existing, error: readError } = await client
    .from("site_settings")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;

  const body = { ...payload };
  const skipped: string[] = [];

  for (let attempt = 0; attempt <= MAX_DROPPED_COLUMNS; attempt++) {
    const { error } = existing?.id
      ? await client.from("site_settings").update(body).eq("id", existing.id)
      : await client.from("site_settings").insert(body);
    if (!error) return skipped;

    const column = missingColumn(error);
    if (!column || !(column in body)) throw error;
    console.warn(
      `site_settings.${column} does not exist — dropping it from the save. ` +
        "Run supabase/full_setup.sql against the project to apply pending migrations.",
    );
    delete body[column];
    skipped.push(column);
    if (Object.keys(body).length === 0) throw error;
  }

  throw new Error(
    "site_settings: too many missing columns — the database is far behind " +
      "supabase/migrations. Run supabase/full_setup.sql in the Supabase SQL editor.",
  );
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const client = db();

  // Each editor page submits only its own fields; the payload must stay
  // scoped to them, otherwise saving one page would null the others.
  const pageRaw = String(formData.get("page") ?? "");
  const page: SettingsPage = (SETTINGS_PAGES as string[]).includes(pageRaw)
    ? (pageRaw as SettingsPage)
    : "home";
  const backTo = `/admin/pages/${page}`;

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
  const image = async (k: string) => {
    // uploaded file or existing url
    let url = text(k);
    const file = formData.get(`${k}__file`);
    if (file instanceof File && file.size > 0) {
      try {
        url = await uploadImage(file, "site");
      } catch (e) {
        rethrowControlFlow(e);
        console.error(`${k} upload failed:`, e);
        const why = describeDbError(e);
        redirect(
          `${backTo}?error=${encodeURIComponent(`تعذّر رفع الصورة: ${why}`.slice(0, 200))}`,
        );
      }
    }
    return url;
  };

  const payload: Record<string, unknown> = {};

  if (page === "home") {
    Object.assign(payload, {
      promo_enabled: bool("promo_enabled"),
      promo_bar_text: text("promo_bar_text"),
      promo_code: text("promo_code"),
      hero_headline: text("hero_headline"),
      hero_subhead: text("hero_subhead"),
      hero_image_url: await image("hero_image_url"),
      hero_primary_cta_label: text("hero_primary_cta_label"),
      hero_primary_cta_url: text("hero_primary_cta_url"),
      hero_secondary_cta_label: text("hero_secondary_cta_label"),
      hero_secondary_cta_url: text("hero_secondary_cta_url"),
      hero_microproof: text("hero_microproof"),
      hero_trust_badge: text("hero_trust_badge"),
      problem_heading: text("problem_heading"),
      problem_subhead: text("problem_subhead"),
      problem_points: list("problem_points"),
      instructor_eyebrow: text("instructor_eyebrow"),
      instructor_name: text("instructor_name"),
      instructor_image_url: await image("instructor_image_url"),
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
      outcome_points: list("outcome_points"),
      ai_badge: text("ai_badge"),
      ai_headline: text("ai_headline"),
      ai_subhead: text("ai_subhead"),
      ai_points: list("ai_points"),
      ai_cta_label: text("ai_cta_label"),
      ai_note: text("ai_note"),
      testimonials_eyebrow: text("testimonials_eyebrow"),
      testimonials_heading: text("testimonials_heading"),
      faq_eyebrow: text("faq_eyebrow"),
      faq_heading: text("faq_heading"),
      faq_help_text: text("faq_help_text"),
      faq_help_cta_label: text("faq_help_cta_label"),
      final_cta_eyebrow: text("final_cta_eyebrow"),
      final_cta_heading: text("final_cta_heading"),
      final_cta_subhead: text("final_cta_subhead"),
      final_cta_primary_label: text("final_cta_primary_label"),
      final_cta_primary_url: text("final_cta_primary_url"),
      final_cta_secondary_label: text("final_cta_secondary_label"),
      final_cta_secondary_url: text("final_cta_secondary_url"),
      final_cta_proof: text("final_cta_proof"),
      blog_heading: text("blog_heading"),
      blog_subhead: text("blog_subhead"),
      blog_view_all_label: text("blog_view_all_label"),
    });
  } else if (page === "about") {
    Object.assign(payload, {
      about_body: text("about_body"),
      vision_text: text("vision_text"),
      vision_cta_label: text("vision_cta_label"),
      vision_cta_url: text("vision_cta_url"),
    });
  } else if (page === "blog") {
    Object.assign(payload, {
      blog_page_heading: text("blog_page_heading"),
      blog_page_subhead: text("blog_page_subhead"),
    });
  } else {
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
    Object.assign(payload, {
      contact_heading: text("contact_heading"),
      contact_subhead: text("contact_subhead"),
      whatsapp_number: text("whatsapp_number"),
      contact_email: text("contact_email"),
      social_links: Object.keys(socialEntries).length ? socialEntries : null,
    });
  }

  let skipped: string[] = [];
  try {
    skipped = await writeSettings(client, payload);
  } catch (e) {
    rethrowControlFlow(e);
    console.error("saveSettings failed:", e);
    redirect(`${backTo}?error=${encodeURIComponent(describeDbError(e).slice(0, 200))}`);
  }

  revalidatePath(backTo);
  revalidatePath("/", "layout"); // settings drive header/footer/promo site-wide
  redirect(
    `${backTo}?saved=1${skipped.length ? `&skipped=${encodeURIComponent(skipped.join(","))}` : ""}`,
  );
}

export async function deleteWaitlistEntry(id: string) {
  await requireAdmin();
  const { error } = await db().from("ai_waitlist").delete().eq("id", id);
  if (error) dbFail("تعذّر حذف المشترك", error);
  revalidatePath("/admin/waitlist");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
