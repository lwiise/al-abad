#!/usr/bin/env node
/**
 * One-off: import Phase-2 course landing content from courses-content.json.
 *
 *   node scripts/import-courses-content.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (env or .env.local)
 * and the JSON file from the repo root or /data. For each course it:
 *   • upserts the `courses` row by slug (PARTIAL payload — only keys present in
 *     the JSON are written, so re-runs never null out good data; hero_image_url
 *     is intentionally left untouched so the owner's uploaded covers survive),
 *   • replaces that course's `course_modules` rows (delete-then-insert),
 * and finally tops up the shared FAQ set with the two course-wide questions
 * (access duration + certificate) if they don't already exist.
 *
 * Idempotent. Schema must already be applied (migration 0003).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
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

// --- small helpers ---------------------------------------------------------
function clean(s) {
  if (s == null) return null;
  const t = String(s).trim();
  return t === "" ? null : t;
}

function parsePrice(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseInt0(v) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Coerce a value to a clean string[] (drops blanks). */
function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => clean(x)).filter((x) => x != null);
}

/** Locate + parse courses-content.json (repo root or /data). */
function readContent() {
  const candidates = [
    join(ROOT, "courses-content.json"),
    join(ROOT, "data", "courses-content.json"),
  ];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, "utf8");
      const json = JSON.parse(raw);
      const courses = Array.isArray(json)
        ? json
        : Array.isArray(json?.courses)
          ? json.courses
          : Array.isArray(json?.data)
            ? json.data
            : null;
      if (!courses) {
        throw new Error(`No course array found in ${p} (expected an array or { courses: [...] }).`);
      }
      console.log(`Reading ${p} — ${courses.length} course(s).`);
      if (json?._note) console.log(`  _note: ${json._note}`);
      return courses;
    } catch (err) {
      if (err.code === "ENOENT") continue;
      throw err;
    }
  }
  throw new Error(
    "courses-content.json not found. Drop it in the repo root or /data, then re-run.",
  );
}

async function importCourse(supabase, c) {
  const slug = clean(c.slug);
  const title = clean(c.title);
  if (!slug || !title) {
    console.warn(`  ! skipping course with missing slug/title: ${JSON.stringify({ slug, title })}`);
    return null;
  }

  // PARTIAL payload: only write keys that carry a value. hero_image_url is
  // deliberately omitted (owner-uploaded covers must survive re-imports).
  const payload = { slug, title };
  const subtitle = clean(c.hero_summary);
  if (subtitle) payload.subtitle = subtitle;
  const description = clean(c.body_markdown);
  if (description) payload.description = description;
  const price = parsePrice(c.price);
  if (price != null) payload.price = price;
  const priceOriginal = parsePrice(c.price_original);
  if (priceOriginal != null) payload.price_original = priceOriginal;
  const currency = clean(c.currency);
  if (currency) payload.currency = currency;
  const ctaUrl = clean(c.cta_url);
  if (ctaUrl) payload.cta_url = ctaUrl;
  const videoUrl = clean(c.video_preview_url);
  if (videoUrl) payload.video_preview_url = videoUrl;
  const guarantee = clean(c.guarantee_text);
  if (guarantee) payload.guarantee_text = guarantee;
  const outcomes = asStringArray(c.outcomes);
  if (outcomes.length) payload.outcomes = outcomes;

  const { data: row, error } = await supabase
    .from("courses")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw new Error(`courses upsert ${slug}: ${error.message}`);

  const moduleCount = await replaceModules(supabase, row.id, c.modules);
  console.log(`  ✓ ${slug} — ${outcomes.length} outcome(s), ${moduleCount} module(s)`);
  return row.id;
}

async function replaceModules(supabase, courseId, modules) {
  const list = Array.isArray(modules) ? modules : [];

  const { error: delErr } = await supabase
    .from("course_modules")
    .delete()
    .eq("course_id", courseId);
  if (delErr) throw new Error(`course_modules delete ${courseId}: ${delErr.message}`);

  const records = [];
  list.forEach((m, i) => {
    const title = clean(m?.title);
    if (!title) return;
    records.push({
      course_id: courseId,
      title,
      lessons: parseInt0(m?.lessons),
      duration: clean(m?.duration),
      sort_order: i + 1,
      is_published: true,
    });
  });

  if (records.length) {
    const { error } = await supabase.from("course_modules").insert(records);
    if (error) throw new Error(`course_modules insert ${courseId}: ${error.message}`);
  }
  return records.length;
}

/** Add the two shared, site-wide FAQs if a row with that question is missing. */
async function topUpFaqs(supabase) {
  const extras = [
    {
      question: "ما مدة الوصول إلى الدورة؟",
      answer:
        "بمجرد اشتراكك يصبح لديك وصولٌ كامل ودائم إلى محتوى الدورة عبر منصة الأكاديمية، تُشاهده في أي وقتٍ وبالوتيرة التي تناسبك.",
    },
    {
      question: "هل أحصل على شهادة عند إتمام الدورة؟",
      answer:
        "نعم، تحصل على شهادة إتمامٍ إلكترونية بعد إكمالك لمحتوى الدورة، يمكنك حفظها أو مشاركتها.",
    },
  ];

  const { data: existing, error: readErr } = await supabase
    .from("faqs")
    .select("question, sort_order");
  if (readErr) throw new Error(`faqs read: ${readErr.message}`);

  const haveQuestions = new Set((existing ?? []).map((f) => (f.question ?? "").trim()));
  let nextOrder = (existing ?? []).reduce((max, f) => Math.max(max, f.sort_order ?? 0), 0);

  const toInsert = [];
  for (const e of extras) {
    if (haveQuestions.has(e.question)) continue;
    nextOrder += 1;
    toInsert.push({ ...e, sort_order: nextOrder, is_published: true });
  }

  if (toInsert.length) {
    const { error } = await supabase.from("faqs").insert(toInsert);
    if (error) throw new Error(`faqs insert: ${error.message}`);
  }
  console.log(`FAQ top-up: added ${toInsert.length}, total now ${(existing?.length ?? 0) + toInsert.length}.`);
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).",
    );
    process.exit(1);
  }

  const courses = readContent();
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let ok = 0;
  for (const c of courses) {
    const id = await importCourse(supabase, c);
    if (id) ok += 1;
  }

  await topUpFaqs(supabase);

  console.log(`\nDone. Imported/updated ${ok}/${courses.length} course(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
