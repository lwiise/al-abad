import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteMark } from "@/components/ui/quote-mark";
import { HeadingRule, Section, SectionHeading } from "@/components/sections/section";
import { Swatch } from "./swatch";

/**
 * ============================================================================
 * /styleguide — every colour decision on one page
 * ============================================================================
 *
 * This exists because the site drifted into two palettes without anyone
 * noticing: the homepage ran warm to section 4 and cold from section 5 for
 * months. Drift is invisible when you can only see one section at a time.
 *
 * Rules for keeping it useful:
 *   · Never hardcode a hex here — swatches read their own computed value.
 *   · Every Button variant is shown on light AND on ink. That is where the
 *     gaps show: `primary` is unusable on ink by design (CLAUDE.md), and
 *     there is currently no on-dark variant, so dark sections hand-roll.
 *   · The rhythm strip is the homepage order. If it stops matching
 *     app/(marketing)/page.tsx, fix one of the two.
 *
 * Contrast is NOT eyeballed here — `pnpm check-contrast` is the source of
 * truth and fails the build on a regression.
 */

export const metadata: Metadata = {
  title: "دليل الألوان — داخلي",
  robots: { index: false, follow: false },
};

const BRAND = [
  { token: "plum", className: "bg-plum", role: "أساسي — أزرار، روابط، تأكيد" },
  { token: "teal", className: "bg-teal", role: "ثانوي — لمسات مساندة وأيقونات" },
  { token: "coral", className: "bg-coral", role: "تمييز — شريط العرض وأهم زر" },
  { token: "violet", className: "bg-violet", role: "إبراز — قسم الذكاء وشارات «قريباً»" },
  { token: "lilac", className: "bg-lilac", role: "تظليل — خلفيات متناوبة وبطاقات" },
  { token: "ink", className: "bg-ink", role: "نص أساسي، الأقسام الداكنة، التذييل" },
];

const NEUTRALS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => ({
  token: `neutral-${n}`,
  className: `bg-neutral-${n}`,
}));

const SEMANTIC = [
  { token: "background", className: "bg-background", role: "خلفية الصفحة" },
  { token: "surface", className: "bg-surface", role: "بطاقات ومساحات داخلية" },
  { token: "surface-strong", className: "bg-surface-strong", role: "الشريط المتناوب" },
  { token: "foreground", className: "bg-foreground", role: "النص الأساسي" },
  { token: "foreground-muted", className: "bg-foreground-muted", role: "النص الثانوي" },
  { token: "foreground-subtle", className: "bg-foreground-subtle", role: "بيانات وصفية فقط" },
  { token: "border", className: "bg-border", role: "حدود ناعمة" },
  { token: "border-strong", className: "bg-border-strong", role: "حدود أوضح" },
  { token: "accent-strong", className: "bg-accent-strong", role: "coral كنصّ — على الفاتح فقط" },
  { token: "focus", className: "bg-focus", role: "حلقة التركيز" },
  { token: "whatsapp", className: "bg-whatsapp", role: "علامة طرف ثالث — لا تُستخدم لغير ذلك" },
];

const ACTIONS = [
  { role: "primary", fill: "bg-primary", hover: "bg-primary-hover", label: "text-on-primary" },
  { role: "secondary", fill: "bg-secondary", hover: "bg-secondary-hover", label: "text-on-secondary" },
  { role: "accent", fill: "bg-accent", hover: "bg-accent-hover", label: "text-on-accent" },
  { role: "highlight", fill: "bg-highlight", hover: "bg-highlight-hover", label: "text-on-highlight" },
];

const VARIANTS = ["primary", "secondary", "outline", "ghost", "danger"] as const;
const TONES = ["published", "draft", "highlight", "neutral"] as const;

/**
 * The elevation ramp, shown on BOTH light grounds on purpose.
 *
 * A shadow is the one token whose whole job is to separate a surface from what
 * is behind it, so a swatch of it in isolation says nothing. The two grounds
 * here are the two real pairings on the site: white-on-white (the الأسئلة card,
 * 1.0:1 — no ground step whatsoever) and white-on-surface (the admin panel and
 * قسم المنهج, 1.07:1, which CLAUDE.md calls below the threshold of perception).
 * In both, the shadow is doing all of the work and the border is only an edge.
 *
 * Every value is ink-tinted, so this whole ramp is for LIGHT grounds only —
 * hence no ink column. A shadow on a dark band is invisible, and the two dark
 * sections that need a figure lifted off their plate use a coloured glow
 * instead (`.ai-tile`) or light rather than shade (`ai-assistant-preview`).
 */
const ELEVATION = [
  { token: "shadow-sm", role: "البطاقات — الحالة الافتراضية" },
  { token: "shadow-md", role: "بطاقة بارزة، أو وجهة تمرير من sm" },
  { token: "shadow-lg", role: "قائمة منسدلة، زرّ عائم، لوح مرتفع" },
  { token: "shadow-xl", role: "أثقل عنصر في قسمه — plum بدل ink" },
  { token: "shadow-nav", role: "الأشرطة الثابتة الممتدة فقط — لا للبطاقات" },
];

/** Homepage order — keep in sync with app/(marketing)/page.tsx. */
const RHYTHM: { n: number; name: string; bg: string; tone: string; dark?: boolean }[] = [
  { n: 1, name: "الواجهة", bg: "bg-background", tone: "أرضية فاتحة + لوح neutral-900" },
  { n: 2, name: "المشكلة", bg: "section-hero-surface", tone: "امتداد سطح الواجهة" },
  { n: 3, name: "التعريف", bg: "bg-ink", tone: "ink — مرساة داكنة", dark: true },
  { n: 4, name: "الدورات", bg: "bg-background", tone: "background" },
  { n: 5, name: "كيف نعمل", bg: "bg-surface-strong", tone: "lilac" },
  { n: 6, name: "النتائج", bg: "bg-background", tone: "background" },
  { n: 7, name: "الذكاء", bg: "bg-neutral-900", tone: "night + حقل نقاط حيّ", dark: true },
  { n: 8, name: "الآراء", bg: "bg-background", tone: "background + بطاقات surface" },
  { n: 9, name: "الأسئلة", bg: "bg-background", tone: "background" },
  { n: 10, name: "الدعوة", bg: "bg-background", tone: "background + بطاقة فاتحة" },
  { n: 11, name: "المدونة", bg: "bg-surface-strong", tone: "lilac" },
];

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="mt-14 first:mt-0">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <Section bg="background">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium text-secondary">داخلي</p>
          <h1 className="text-4xl font-extrabold text-foreground">دليل الألوان</h1>
          <HeadingRule />
          <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
            كل رمز لوني ومكوّن في صفحة واحدة. الغرض أن يظهر أي انحراف فوراً بدل أن يختبئ بين
            الأقسام. التباين يُتحقَّق منه بـ <code dir="ltr" className="font-mono text-base">pnpm check-contrast</code>،
            لا بالعين.
          </p>
        </div>
      </Section>

      <Section bg="surface">
        <Group
          title="إيقاع الأقسام"
          note="ترتيب الصفحة الرئيسية. التناوب أبيض ↔ lilac، ومرساتان داكنتان: القسم ٣ على ink والقسم ٧ على night. لا يُستخدم surface شريطاً متناوباً: الفرق بينه وبين الأبيض ١٫٠٧:١، أي دون عتبة الإدراك. القسم ٢ استثناء مقصود: يواصل لون surface نفسه — وهو اللون الذي تنتهي عليه الواجهة — فيقرآن ورقةً واحدة بلا خطّ فاصل. والقسم ٧ هو أغمق درجة في السلّم (neutral-900) لأن أرضيته حقل نقاطٍ حيّ: كل ما يكسبه اللوح من عمقٍ يُصرف في سطوع النقاط، وعلى ink كان الحقل سيُخفَّت حتى يزول. تبقى الأقسام ٨ و٩ و١٠ ثلاثة أشرطة بيضاء متتالية بلا خطوة بينها — قرارُ مالك، والفارق أن الدخول إليها صار من أحدّ قطعٍ في الصفحة."
        >
          <ul className="overflow-hidden rounded-2xl border border-border-strong">
            {RHYTHM.map((r) => (
              <li key={r.n} className={`flex items-center gap-4 px-5 py-4 ${r.bg}`}>
                <span
                  dir="ltr"
                  className={`w-6 shrink-0 font-mono text-xs ${
                    r.dark ? "text-white/55" : "text-foreground-subtle"
                  }`}
                >
                  {r.n}
                </span>
                <span className={`flex-1 font-medium ${r.dark ? "text-white" : "text-foreground"}`}>
                  {r.name}
                </span>
                <span
                  dir="ltr"
                  className={`font-mono text-xs ${
                    r.dark ? "text-white/74" : "text-foreground-muted"
                  }`}
                >
                  {r.tone}
                </span>
              </li>
            ))}
          </ul>
        </Group>
      </Section>

      <Section bg="background">
        <Group title="ألوان العلامة">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BRAND.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
        </Group>

        <Group title="السلّم المحايد" note="مائل إلى البنفسجي — لا رمادي محايد، ولا أسود خالص.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {NEUTRALS.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
        </Group>

        <Group title="الأدوار الدلالية">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SEMANTIC.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
        </Group>

        <Group
          title="أدوار الأفعال"
          note="لكل دور تعبئة، وحالة تمرير، ولون نص. الأبيض على coral هو ٣٫٨٤:١ — التباين متماثل، فهذا نفس رقم coral كنصّ. لذلك coral لون تعبئة لا لون نص: النصّ الصغير يستعمل accent-strong (٦٫١٢:١ على الأبيض)، والتعبئة تبقى كما هي لأنها تمرّ عتبة ٣:١ للعناصر الرسومية."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {ACTIONS.map((a) => (
              <div key={a.role} className="overflow-hidden rounded-xl border border-border-strong">
                <div className={`flex items-center justify-between px-4 py-5 ${a.fill}`}>
                  <span dir="ltr" className={`font-mono text-sm ${a.label}`}>
                    {a.role}
                  </span>
                  <span dir="ltr" className={`font-mono text-xs opacity-75 ${a.label}`}>
                    {a.label}
                  </span>
                </div>
                <div className={`px-4 py-3 ${a.hover}`}>
                  <span dir="ltr" className={`font-mono text-xs ${a.label}`}>
                    {a.role}-hover
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Group>
      </Section>

      <Section bg="surface">
        <Group
          title="الأزرار — على خلفية فاتحة"
          note="خمسة أنواع في مقاسين. كلها مصمَّمة للخلفيات الفاتحة."
        >
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size="sm">
                {v}
              </Button>
            ))}
          </div>
        </Group>
      </Section>

      <Section bg="ink">
        <div>
          <h2 className="text-xl font-bold text-white">الأزرار — على خلفية داكنة</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/74">
            نفس الأنواع مع <span dir="ltr" className="font-mono">light</span>. ليست نسخة تجميلية
            من المجموعة الفاتحة: plum هو ١٫٢٦:١ على ink وteal هو ٢٫٧٨:١، فلا يمكن إعادة استعمالهما
            — الأساسي على الداكن هو lilac. coral وحده يعمل على الأرضيتين.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} light>
                {v}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} light size="sm">
                {v}
              </Button>
            ))}
          </div>

          <h3 className="mt-10 text-base font-bold text-white">
            نفس الأنواع بدون <span dir="ltr" className="font-mono">light</span> — للمقارنة
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/74">
            هذا ما كانت الأقسام الداكنة تضطر إلى الالتفاف حوله يدوياً.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </div>

          <h3 className="mt-10 text-base font-bold text-white">الرموز على الداكن</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Swatch onDark token="lilac" className="bg-lilac" role="٩٫٥٠:١ — نص وأفعال" />
            <Swatch onDark token="coral" className="bg-coral" role="٣٫٠٨:١ — لمسات فقط" />
            <Swatch onDark token="violet" className="bg-violet" role="٢٫٩٢:١ — زخرفي فقط" />
            <Swatch onDark token="primary" className="bg-primary" role="١٫٢٦:١ — ممنوع على ink" />
          </div>
        </div>
      </Section>

      <Section bg="background">
        <Group title="الشارات">
          <div className="flex flex-wrap items-center gap-3">
            {TONES.map((t) => (
              <Badge key={t} tone={t}>
                {t}
              </Badge>
            ))}
          </div>
        </Group>

        <Group
          title="عناصر العناوين"
          note="خط العنوان مسطّح دائماً. كان تدرّجاً من plum إلى teal مكرَّراً حرفياً في سبعة مواضع — وهو أوضح إشارة إلى قالب جاهز. لا تُعده."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border-strong bg-surface p-8">
              <SectionHeading
                eyebrow="تمهيد"
                title="عنوان على خلفية فاتحة"
                sub="النص الثانوي تحت العنوان، بلون foreground-muted."
                align="start"
              />
            </div>
            <div className="rounded-2xl bg-ink p-8">
              <SectionHeading
                eyebrow="تمهيد"
                title="عنوان على خلفية داكنة"
                sub="على الداكن يصبح التمهيد lilac لا violet — البنفسجي ٢٫٩٢:١ على ink."
                align="start"
                light
              />
            </div>
          </div>

          <div className="mt-8 flex items-start gap-8 rounded-2xl border border-border-strong bg-surface p-8">
            <QuoteMark />
            <p className="text-foreground-muted">
              علامة الاقتباس — plum مسطّح بشفافية ٢٥٪. كانت تحمل نفس التدرّج الذي حُذف من خط
              العنوان.
            </p>
          </div>
        </Group>
      </Section>

      <Section bg="surface">
        <Group
          title="الارتفاع والظلال"
          note="الحدّ الشعري ليس ارتفاعاً: رمز border نسبته ١٫١٦:١ على الأبيض، فلا يكفي وحده ليقول إن السطح أمام الصفحة لا مرسومٌ عليها. لذلك كل بطاقة تحمل حداً وظلاً معاً — الحدّ يرسم الحافة والظل يفصل السطح. جميع القيم مصبوغة بـ ink، أي أنها للأرضيات الفاتحة وحدها؛ على الداكن يختفي الظل تماماً، فتُستخدم هناك هالةٌ ملوّنة أو ضوء بدل الظل. والصفّان أدناه هما الاقترانان الحقيقيان في الموقع: أبيض على أبيض (١٫٠٠:١) وأبيض على surface (١٫٠٧:١)."
        >
          <ul className="space-y-3">
            {ELEVATION.map((e) => (
              <li
                key={e.token}
                className="grid items-center gap-4 rounded-xl border border-border-strong bg-background p-4 sm:grid-cols-[11rem_1fr]"
              >
                <div>
                  <code dir="ltr" className="block font-mono text-sm text-foreground">
                    {e.token}
                  </code>
                  <span className="mt-1 block text-xs leading-relaxed text-foreground-subtle">
                    {e.role}
                  </span>
                </div>
                {/* The same card on both grounds, side by side — the pair is the
                    point. On one it has no ground step at all and on the other
                    1.07:1, so anything you can see separating them is the
                    shadow. Rendered as real utilities, never as hardcoded
                    values, for the same reason the swatches read their own
                    computed colour. */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-background p-4">
                    <div
                      className={`rounded-lg border border-border bg-background px-4 py-5 text-center text-xs text-foreground-muted ${e.token}`}
                    >
                      على background
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <div
                      className={`rounded-lg border border-border bg-background px-4 py-5 text-center text-xs text-foreground-muted ${e.token}`}
                    >
                      على surface
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Group>
      </Section>
    </>
  );
}
