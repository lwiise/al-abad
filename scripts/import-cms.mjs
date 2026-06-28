#!/usr/bin/env node
/**
 * One-off: import the Webflow CSV exports into Supabase.
 *
 *   node scripts/import-cms.mjs [coursesCsv] [blogCsv] [faqsCsv]
 *
 * With no args it reads the three exports from ~/Downloads. Reads
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the environment,
 * falling back to .env.local (same loader as create-admin.mjs), and writes via
 * the service-role client (bypasses RLS).
 *
 * What it does:
 *   - Courses  → upsert on slug (enriches the 15 seed rows; no duplicates).
 *   - Blog     → upsert on slug (fills the 3 stubs + adds the rest = 15).
 *   - FAQs     → replace: delete existing rows, insert the CSV Q&As.
 *   - Webflow rich-text HTML  → Markdown (the site renders via react-markdown).
 *   - Webflow CDN images      → re-hosted in the Supabase `media` bucket.
 *
 * Idempotent: safe to re-run (upsert by slug, deterministic image paths with
 * upsert:true, FAQs delete-then-insert). Optional columns are only written when
 * the CSV has a value, so a re-run never nulls out good data.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import TurndownService from "turndown";

// --- env -------------------------------------------------------------------

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}

// --- transforms ------------------------------------------------------------

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  emDelimiter: "*",
  codeBlockStyle: "fenced",
});

/** Webflow rich-text HTML → clean Markdown, or null when empty. */
function htmlToMarkdown(html) {
  if (!html) return null;
  const cleaned = html
    .replace(/‍/g, "") // zero-width joiner littered through Webflow copy
    .replace(/&nbsp;| /g, " ");
  let md = turndown.turndown(cleaned);
  // Promote headings one level so they land in the h1–h3 range that
  // components/ui/markdown.tsx actually styles (Webflow uses mostly h3/h4).
  md = md.replace(/^(#{1,6})\s+/gm, (_, hashes) => "#".repeat(Math.max(1, hashes.length - 1)) + " ");
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return md || null;
}

/** "Tue Feb 23 2021 00:00:00 GMT+0000 (…)" → ISO string, or null. */
function parseWebflowDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseBool(s) {
  return String(s).trim().toLowerCase() === "true";
}

function parsePrice(s) {
  if (s == null) return null;
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function clean(s) {
  const t = (s ?? "").trim();
  return t === "" ? null : t;
}

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const stats = { imagesOk: 0, imagesFail: 0 };

/**
 * Download a Webflow CDN image and re-host it in the Supabase `media` bucket at
 * a deterministic path. Returns the public URL, or null on any failure (the
 * import keeps going — a missing image must not block the row).
 */
async function rehostImage(supabase, url, folder, slug) {
  const src = clean(url);
  if (!src) return null;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    const buf = Buffer.from(await res.arrayBuffer());

    let ext = (extname(new URL(src).pathname).slice(1) || "").toLowerCase();
    if (!ext || ext.length > 5) ext = EXT_BY_TYPE[contentType] ?? "jpg";

    const path = `${folder}/${slug}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, buf, {
      contentType: contentType || "image/jpeg",
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    stats.imagesOk += 1;
    console.log(`    ↳ image → ${path}`);
    return data.publicUrl;
  } catch (err) {
    stats.imagesFail += 1;
    console.warn(`    ! image failed for ${folder}/${slug}: ${err.message}`);
    return null;
  }
}

function readCsv(path) {
  const raw = readFileSync(path, "utf8");
  return parse(raw, { columns: true, bom: true, skip_empty_lines: true, relax_column_count: true });
}

// --- importers -------------------------------------------------------------

async function importCourses(supabase, path) {
  console.log(`\n=== Courses (${path}) ===`);
  const rows = readCsv(path);
  let n = 0;
  for (const r of rows) {
    const slug = clean(r["Slug"]);
    const title = clean(r["Arabic Name"]) ?? clean(r["Name"]);
    if (!slug || !title) {
      console.warn(`  skip course (missing slug/title): ${r["Name"] ?? "?"}`);
      continue;
    }
    console.log(`  • ${slug}`);

    const payload = { slug, title, currency: "SAR", is_published: !(parseBool(r["Archived"]) || parseBool(r["Draft"])) };
    const subtitle = clean(r["Hero Summary"]);
    if (subtitle) payload.subtitle = subtitle;
    const description = htmlToMarkdown(r["what is inside the course"]);
    if (description) payload.description = description;
    const price = parsePrice(r["Offer price"]) ?? parsePrice(r["Course price"]);
    if (price != null) payload.price = price;
    const ctaUrl = clean(r["Course link"]);
    if (ctaUrl) payload.cta_url = ctaUrl;
    const hero = await rehostImage(supabase, r["Cover image"] || r["No video Image"], "courses", slug);
    if (hero) payload.hero_image_url = hero;

    const { error } = await supabase.from("courses").upsert(payload, { onConflict: "slug" });
    if (error) throw new Error(`courses upsert ${slug}: ${error.message}`);
    n += 1;
  }
  console.log(`  ✓ ${n} courses upserted`);
  return n;
}

async function importBlog(supabase, path) {
  console.log(`\n=== Blog posts (${path}) ===`);
  const rows = readCsv(path);
  let n = 0;
  for (const r of rows) {
    const slug = clean(r["Slug"]);
    const title = clean(r["Arabic Title"]) ?? clean(r["Name"]);
    if (!slug || !title) {
      console.warn(`  skip post (missing slug/title): ${r["Name"] ?? "?"}`);
      continue;
    }
    console.log(`  • ${slug}`);

    const payload = { slug, title, is_published: !(parseBool(r["Archived"]) || parseBool(r["Draft"])) };
    const excerpt = clean(r["Post Summary"]);
    if (excerpt) payload.excerpt = excerpt;
    const body = htmlToMarkdown(r["Post Body"]);
    if (body) payload.body = body;
    const publishedAt = parseWebflowDate(r["Post Date"]);
    if (publishedAt) payload.published_at = publishedAt;
    const cover = await rehostImage(supabase, r["Main Image"], "blog", slug);
    if (cover) payload.cover_image_url = cover;

    const { error } = await supabase.from("blog_posts").upsert(payload, { onConflict: "slug" });
    if (error) throw new Error(`blog upsert ${slug}: ${error.message}`);
    n += 1;
  }
  console.log(`  ✓ ${n} blog posts upserted`);
  return n;
}

async function importFaqs(supabase, path) {
  console.log(`\n=== FAQs (${path}) ===`);
  const rows = readCsv(path);

  const { error: delErr } = await supabase.from("faqs").delete().not("id", "is", null);
  if (delErr) throw new Error(`faqs delete: ${delErr.message}`);

  const records = [];
  rows.forEach((r, i) => {
    const question = clean(r["Question"]);
    if (!question) return;
    records.push({
      question,
      answer: clean(r["Answer"]),
      sort_order: i + 1,
      is_published: !(parseBool(r["Archived"]) || parseBool(r["Draft"])),
    });
  });

  const { error } = await supabase.from("faqs").insert(records);
  if (error) throw new Error(`faqs insert: ${error.message}`);
  console.log(`  ✓ ${records.length} FAQs inserted (replaced existing)`);
  return records.length;
}

// --- main ------------------------------------------------------------------

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).");
    process.exit(1);
  }

  const dl = join(homedir(), "Downloads");
  const [coursesCsv, blogCsv, faqsCsv] = [
    process.argv[2] ?? join(dl, "Al-Abbad - Academy Courses - 618bc072d2d675a9299571a3.csv"),
    process.argv[3] ?? join(dl, "Al-Abbad - Blog Posts - 618ccdc173c5cc6caf8285f7.csv"),
    process.argv[4] ?? join(dl, "Al-Abbad - Q&As - 6190e04a33c64a0b0884d2ad.csv"),
  ];

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const courses = await importCourses(supabase, coursesCsv);
  const blog = await importBlog(supabase, blogCsv);
  const faqs = await importFaqs(supabase, faqsCsv);

  console.log("\n──────────────────────────────────────");
  console.log(`Done. courses=${courses}  blog=${blog}  faqs=${faqs}`);
  console.log(`Images: ${stats.imagesOk} re-hosted, ${stats.imagesFail} failed`);
  console.log("──────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
