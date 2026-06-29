#!/usr/bin/env node
/**
 * One-off: generate data/courses-content.json for the Phase-2 course landing
 * pages. Pulls the REAL fields (title / summary / body / price / cta) from the
 * 15 courses already in Supabase, and fills the new sales fields with
 * finished-looking DEMO content (tagged per-course in `placeholders`, to be
 * swapped by the owner later via /admin). Then run import-courses-content.mjs.
 *
 *   node scripts/generate-courses-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* rely on real env */
  }
}

const GUARANTEE =
  "ضمان استرجاع كامل خلال 14 يوماً — إن لم تجد قيمةً حقيقيةً في الدورة، نُعيد لك مبلغك دون أسئلة.";

/** Plausible anchor price (struck through) for price-anchoring. */
function anchor(price) {
  if (price == null) return null;
  if (price <= 200) return 500;
  if (price <= 600) return 990;
  return 1990;
}

// Finished-looking DEMO outcomes + curriculum, tailored per course topic.
const DEMO = {
  "comprehensive-marriage-guide-in-8-parts": {
    outcomes: [
      "تتقن منهجيةً متكاملةً للإرشاد الزواجي من البداية حتى المتابعة.",
      "تشخّص جذور الخلافات الزوجية وتتعامل معها بأدواتٍ عملية.",
      "تصمّم خطة تدخّلٍ مناسبةً لكل حالةٍ زوجيةٍ تواجهها.",
      "تكتسب ثقة التعامل مع أصعب المواقف الزوجية باحتراف.",
    ],
    modules: [
      { title: "أسس الإرشاد الزواجي ومبادئه", lessons: 6, duration: "ساعة" },
      { title: "مهارات الإنصات والتواصل الفعّال", lessons: 5, duration: "50 دقيقة" },
      { title: "تشخيص المشكلات الزوجية", lessons: 5, duration: "55 دقيقة" },
      { title: "أدوات التدخّل وبناء الحلول", lessons: 6, duration: "ساعة" },
      { title: "إدارة الجلسات الصعبة والمتابعة", lessons: 4, duration: "45 دقيقة" },
    ],
  },
  "characteristics-of-the-marriage-guide": {
    outcomes: [
      "تتعرّف على الصفات الأساسية للموجّه الزواجي الناجح.",
      "تطوّر حضورك المهني وثقة المسترشدين بك.",
      "تتجنّب الأخطاء الشائعة التي تُفقد الموجّه مصداقيته.",
      "تبني هويةً مهنيةً واضحةً في مجال الإرشاد الأسري.",
    ],
    modules: [
      { title: "من هو الموجّه الزواجي؟", lessons: 4, duration: "35 دقيقة" },
      { title: "الصفات الشخصية والمهنية", lessons: 5, duration: "45 دقيقة" },
      { title: "أخلاقيات المهنة وحدودها", lessons: 4, duration: "40 دقيقة" },
      { title: "بناء الثقة مع المسترشدين", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "marital-compatibility": {
    outcomes: [
      "تفهم أبعاد التوافق الزواجي ومقوّماته.",
      "تكتشف نقاط الانسجام والاختلاف بينك وبين شريكك.",
      "تتعلّم كيف تحوّل الاختلاف إلى تكامل.",
      "تضع أساساً متيناً لعلاقةٍ مستقرةٍ وطويلة.",
    ],
    modules: [
      { title: "مفهوم التوافق الزواجي", lessons: 4, duration: "30 دقيقة" },
      { title: "أنماط الشخصية في العلاقة", lessons: 5, duration: "45 دقيقة" },
      { title: "إدارة الاختلافات", lessons: 4, duration: "40 دقيقة" },
      { title: "خارطة طريقٍ للتوافق", lessons: 3, duration: "30 دقيقة" },
    ],
  },
  "love-cycle-and-attachment-patterns": {
    outcomes: [
      "تفهم دورة الحب ومراحلها في العلاقة الزوجية.",
      "تتعرّف على أنماط التعلّق وأثرها في علاقتك.",
      "تكتشف نمط تعلّقك ونمط شريكك.",
      "تتعامل مع مشاعر القلق والتجنّب بوعي.",
    ],
    modules: [
      { title: "دورة الحب ومراحلها", lessons: 4, duration: "35 دقيقة" },
      { title: "أنماط التعلّق الأربعة", lessons: 5, duration: "50 دقيقة" },
      { title: "تأثير التعلّق على العلاقة", lessons: 4, duration: "40 دقيقة" },
      { title: "نحو تعلّقٍ آمن", lessons: 4, duration: "40 دقيقة" },
    ],
  },
  "emotion-management": {
    outcomes: [
      "تتعرّف على مشاعرك وتسمّيها بدقّة.",
      "تتحكّم في انفعالاتك وقت الغضب والتوتر.",
      "تعبّر عن مشاعرك بطريقةٍ صحيةٍ وبنّاءة.",
      "تحوّل الانفعالات السلبية إلى طاقةٍ إيجابية.",
    ],
    modules: [
      { title: "ما هي الانفعالات؟", lessons: 4, duration: "30 دقيقة" },
      { title: "آليات التحكّم الانفعالي", lessons: 5, duration: "45 دقيقة" },
      { title: "التعبير الصحي عن المشاعر", lessons: 4, duration: "40 دقيقة" },
      { title: "تمارين تطبيقية", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "stress-management": {
    outcomes: [
      "تفهم مصادر الضغوط في حياتك الزوجية والعملية.",
      "تكتسب أدواتٍ عمليةً للتعامل مع التوتر اليومي.",
      "تحافظ على هدوئك واتزانك في المواقف الصعبة.",
      "تبني نمط حياةٍ أكثر توازناً وراحة.",
    ],
    modules: [
      { title: "فهم الضغوط ومصادرها", lessons: 4, duration: "35 دقيقة" },
      { title: "استجابة الجسد للضغط", lessons: 4, duration: "35 دقيقة" },
      { title: "تقنيات إدارة التوتر", lessons: 5, duration: "50 دقيقة" },
      { title: "خطة توازنٍ شخصية", lessons: 4, duration: "40 دقيقة" },
    ],
  },
  "understanding-the-drivers-of-behavior": {
    outcomes: [
      "تفهم الدوافع الخفية وراء سلوك الإنسان.",
      "تفسّر تصرفات شريكك بشكلٍ أعمق وأدقّ.",
      "تتعامل مع السلوكيات الصعبة بحكمة.",
      "تطوّر وعيك بذاتك ودوافعك الشخصية.",
    ],
    modules: [
      { title: "مدخلٌ إلى دوافع السلوك", lessons: 4, duration: "35 دقيقة" },
      { title: "الحاجات النفسية الأساسية", lessons: 5, duration: "45 دقيقة" },
      { title: "قراءة السلوك وتفسيره", lessons: 4, duration: "40 دقيقة" },
      { title: "التعامل مع السلوك الصعب", lessons: 4, duration: "40 دقيقة" },
    ],
  },
  "practical-steps-to-deal-with-marital-problems": {
    outcomes: [
      "تتعلّم خطواتٍ عمليةً واضحةً لحل المشكلات الزوجية.",
      "تتعامل مع الخلافات دون تصعيد.",
      "تستعيد التواصل الإيجابي مع شريكك.",
      "تمنع تكرار المشكلات المزمنة.",
    ],
    modules: [
      { title: "تحديد المشكلة بدقّة", lessons: 4, duration: "35 دقيقة" },
      { title: "خطوات الحوار البنّاء", lessons: 5, duration: "45 دقيقة" },
      { title: "أدوات حل النزاع", lessons: 4, duration: "40 دقيقة" },
      { title: "خطة المصالحة والمتابعة", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "windows-to-marriage": {
    outcomes: [
      "تكتشف نوافذ جديدةً لفهم علاقتك الزوجية.",
      "ترى المشكلات من زوايا مختلفة.",
      "تجدّد الحياة الزوجية بأفكارٍ عملية.",
      "تعمّق الترابط العاطفي مع شريكك.",
    ],
    modules: [
      { title: "النافذة الأولى: الذات", lessons: 4, duration: "35 دقيقة" },
      { title: "النافذة الثانية: الشريك", lessons: 4, duration: "35 دقيقة" },
      { title: "النافذة الثالثة: العلاقة", lessons: 4, duration: "40 دقيقة" },
      { title: "النافذة الرابعة: المستقبل", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "anxiety-management-course": {
    outcomes: [
      "تفهم طبيعة القلق وأسبابه.",
      "تميّز بين القلق الطبيعي والمرَضي.",
      "تكتسب تقنياتٍ فعّالةً للسيطرة على القلق.",
      "تستعيد شعورك بالأمان والطمأنينة.",
    ],
    modules: [
      { title: "ما هو القلق؟", lessons: 4, duration: "30 دقيقة" },
      { title: "دورة القلق وأفكاره", lessons: 5, duration: "45 دقيقة" },
      { title: "تقنيات التهدئة", lessons: 4, duration: "40 دقيقة" },
      { title: "خطة مواجهة القلق", lessons: 4, duration: "40 دقيقة" },
    ],
  },
  "body-language-course": {
    outcomes: [
      "تقرأ لغة الجسد وتفهم ما وراء الكلمات.",
      "تكتشف مشاعر الآخرين الحقيقية.",
      "تحسّن تواصلك غير اللفظي مع شريكك.",
      "تبني حضوراً واثقاً ومؤثّراً.",
    ],
    modules: [
      { title: "مدخلٌ إلى لغة الجسد", lessons: 4, duration: "35 دقيقة" },
      { title: "تعابير الوجه والإيماءات", lessons: 5, duration: "45 دقيقة" },
      { title: "إشارات الجسد في العلاقة", lessons: 4, duration: "40 دقيقة" },
      { title: "توظيف لغة الجسد", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "marriage-choice-course": {
    outcomes: [
      "تتعلّم أسس الاختيار الزواجي السليم.",
      "تحدّد معاييرك بوضوحٍ وواقعية.",
      "تتجنّب أخطاء الاختيار الشائعة.",
      "تتّخذ قراراً واعياً ومدروساً.",
    ],
    modules: [
      { title: "أهمية الاختيار الزواجي", lessons: 4, duration: "30 دقيقة" },
      { title: "معايير الاختيار", lessons: 5, duration: "45 دقيقة" },
      { title: "مرحلة التعارف والتقييم", lessons: 4, duration: "40 دقيقة" },
      { title: "اتّخاذ القرار", lessons: 3, duration: "30 دقيقة" },
    ],
  },
  "power-balance-cycle-between-spouses": {
    outcomes: [
      "تفهم ديناميكية توازن القوى بين الزوجين.",
      "تكتشف اختلال التوازن في علاقتك.",
      "تبني علاقةً قائمةً على الشراكة والاحترام.",
      "تتجنّب صراعات السيطرة والتحكّم.",
    ],
    modules: [
      { title: "مفهوم توازن القوى", lessons: 4, duration: "35 دقيقة" },
      { title: "أنماط القوة في العلاقة", lessons: 5, duration: "45 دقيقة" },
      { title: "علامات اختلال التوازن", lessons: 4, duration: "40 دقيقة" },
      { title: "استعادة التوازن", lessons: 4, duration: "40 دقيقة" },
    ],
  },
  "secrets-of-the-sexual-relationship-between-spouses": {
    outcomes: [
      "تفهم أسس العلاقة الحميمة الناجحة.",
      "تتجاوز الحواجز النفسية والتواصلية.",
      "تعزّز الانسجام والرضا بين الزوجين.",
      "تبني علاقةً حميمةً صحيةً ومتوازنة.",
    ],
    modules: [
      { title: "مدخلٌ ومفاهيم أساسية", lessons: 4, duration: "35 دقيقة" },
      { title: "التواصل في العلاقة الحميمة", lessons: 5, duration: "45 دقيقة" },
      { title: "تجاوز المشكلات الشائعة", lessons: 4, duration: "40 دقيقة" },
      { title: "نحو انسجامٍ دائم", lessons: 4, duration: "35 دقيقة" },
    ],
  },
  "gps-marital-relationship": {
    outcomes: [
      "تمتلك خارطةً واضحةً لمسار علاقتك الزوجية.",
      "تحدّد موقعك ووجهتك في العلاقة.",
      "تتجاوز نقاط التحوّل الصعبة بثقة.",
      "تقود علاقتك نحو الاستقرار والسعادة.",
    ],
    modules: [
      { title: "تحديد نقطة البداية", lessons: 4, duration: "35 دقيقة" },
      { title: "رسم خارطة العلاقة", lessons: 5, duration: "45 دقيقة" },
      { title: "نقاط التحوّل الحرجة", lessons: 4, duration: "40 دقيقة" },
      { title: "الوصول إلى الوجهة", lessons: 4, duration: "35 دقيقة" },
    ],
  },
};

function genericDemo(title) {
  return {
    outcomes: [
      `تتقن المفاهيم الأساسية في «${title}».`,
      "تطبّق ما تتعلّمه في حياتك العملية مباشرة.",
      "تتجنّب الأخطاء الشائعة في هذا المجال.",
      "تبني أساساً متيناً تنطلق منه بثقة.",
    ],
    modules: [
      { title: "مقدمة وتأسيس", lessons: 4, duration: "35 دقيقة" },
      { title: "المفاهيم الأساسية", lessons: 5, duration: "45 دقيقة" },
      { title: "التطبيق العملي", lessons: 4, duration: "40 دقيقة" },
      { title: "الخلاصة والخطوات التالية", lessons: 3, duration: "30 دقيقة" },
    ],
  };
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("courses")
    .select("slug,title,subtitle,description,price,currency,cta_url")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const courses = data.map((c) => {
    const demo = DEMO[c.slug] ?? genericDemo(c.title);
    return {
      slug: c.slug,
      title: c.title,
      hero_summary: c.subtitle ?? null,
      body_markdown: c.description ?? null,
      price: c.price,
      price_original: anchor(c.price),
      currency: c.currency ?? "SAR",
      cta_url: c.cta_url,
      video_preview_url: null,
      guarantee_text: GUARANTEE,
      outcomes: demo.outcomes,
      modules: demo.modules,
      // Which fields are demo [تجريبي] placeholders for the owner to replace later.
      placeholders: ["price_original", "guarantee_text", "outcomes", "modules"],
    };
  });

  const out = {
    _note:
      "Phase-2 course landing content. title/hero_summary/body_markdown/price/cta_url are REAL (merged from the old site, already in the CMS). price_original/guarantee_text/outcomes/modules are demo [تجريبي] content — finished-looking placeholders to be edited from /admin. See each course's `placeholders`.",
    courses,
  };

  mkdirSync(join(ROOT, "data"), { recursive: true });
  const dest = join(ROOT, "data", "courses-content.json");
  writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
  console.log(`✓ Wrote ${courses.length} course(s) → data/courses-content.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
