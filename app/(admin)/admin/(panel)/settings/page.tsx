import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminDb } from "../../_lib/db";
import { saveSettings } from "../../_lib/actions";
import { ImageField, MarkdownField } from "../_components/fields";

export const metadata = { title: "إعدادات الموقع" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border bg-background p-6">
      <legend className="px-2 text-sm font-bold text-primary">{title}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  dir,
  placeholder,
  help,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} dir={dir} defaultValue={defaultValue} placeholder={placeholder} />
      {help && <p className="text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}

function AreaField({
  name,
  label,
  defaultValue,
  help,
  rows,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  help?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} rows={rows} defaultValue={defaultValue} />
      {help && <p className="text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}

export default async function SettingsPage(props: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await props.searchParams;
  const { data } = await adminDb().from("site_settings").select("*").limit(1).maybeSingle();
  const s = (data ?? {}) as Record<string, unknown>;
  const social = (s.social_links ?? {}) as Record<string, string>;
  const str = (k: string) => (s[k] == null ? "" : String(s[k]));
  const listVal = (k: string) => (Array.isArray(s[k]) ? (s[k] as string[]).join("\n") : "");

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">إعدادات الموقع</h1>
        {saved && (
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary">
            تم الحفظ
          </span>
        )}
        {error && (
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
            تعذّر الحفظ: {error}
          </span>
        )}
      </header>

      <form action={saveSettings} encType="multipart/form-data" className="space-y-6">
        <Section title="الشريط الترويجي">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="promo_enabled"
              defaultChecked={Boolean(s.promo_enabled)}
              className="size-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm font-medium text-foreground">تفعيل الشريط الترويجي</span>
          </label>
          <TextField name="promo_bar_text" label="نص الشريط" defaultValue={str("promo_bar_text")} />
          <TextField name="promo_code" label="كود الخصم" defaultValue={str("promo_code")} dir="ltr" />
        </Section>

        <Section title="القسم الرئيسي (Hero)">
          <TextField name="hero_headline" label="العنوان الرئيسي" defaultValue={str("hero_headline")} />
          <AreaField name="hero_subhead" label="العنوان الفرعي" defaultValue={str("hero_subhead")} rows={2} />
          <ImageField name="hero_image_url" label="صورة القسم الرئيسي" defaultValue={str("hero_image_url")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="hero_primary_cta_label" label="زر رئيسي — النص" defaultValue={str("hero_primary_cta_label")} />
            <TextField name="hero_primary_cta_url" label="زر رئيسي — الرابط" defaultValue={str("hero_primary_cta_url")} dir="ltr" />
            <TextField name="hero_secondary_cta_label" label="زر ثانوي — النص" defaultValue={str("hero_secondary_cta_label")} />
            <TextField name="hero_secondary_cta_url" label="زر ثانوي — الرابط" defaultValue={str("hero_secondary_cta_url")} dir="ltr" />
          </div>
          <TextField name="hero_microproof" label="إثبات سريع (micro-proof)" defaultValue={str("hero_microproof")} />
          <TextField name="hero_trust_badge" label="شارة الثقة" defaultValue={str("hero_trust_badge")} help="النص بجانب صور المتدربين أعلى القسم" />
        </Section>

        <Section title="قسم الذكاء الاصطناعي">
          <TextField name="ai_badge" label="شارة القسم" defaultValue={str("ai_badge")} placeholder="قريباً" />
          <TextField name="ai_headline" label="العنوان" defaultValue={str("ai_headline")} />
          <AreaField name="ai_subhead" label="العنوان الفرعي" defaultValue={str("ai_subhead")} rows={2} />
          <AreaField name="ai_points" label="النقاط" defaultValue={listVal("ai_points")} help="سطر واحد لكل نقطة" rows={4} />
        </Section>

        <Section title="القوائم">
          <AreaField name="problem_points" label="نقاط المشكلة" defaultValue={listVal("problem_points")} help="سطر واحد لكل نقطة" rows={4} />
          <AreaField name="outcome_points" label="نقاط النتائج" defaultValue={listVal("outcome_points")} help="سطر واحد لكل نقطة" rows={4} />
        </Section>

        <Section title="قسم التحديات">
          <TextField name="problem_heading" label="العنوان" defaultValue={str("problem_heading")} />
          <AreaField name="problem_subhead" label="العنوان الفرعي" defaultValue={str("problem_subhead")} rows={2} />
        </Section>

        <Section title="قسم المدرّب">
          <TextField name="instructor_eyebrow" label="السطر التمهيدي" defaultValue={str("instructor_eyebrow")} />
          <TextField name="instructor_name" label="الاسم / العنوان" defaultValue={str("instructor_name")} />
          <ImageField
            name="instructor_image_url"
            label="صورة المدرّب"
            defaultValue={str("instructor_image_url")}
            help="اتركه فارغاً لاستخدام صورة القسم الرئيسي"
          />
          <AreaField name="instructor_markers" label="الوسوم" defaultValue={listVal("instructor_markers")} help="سطر واحد لكل وسم" rows={3} />
          <TextField name="instructor_cta_label" label="نص زر النبذة" defaultValue={str("instructor_cta_label")} />
        </Section>

        <Section title="قسم الدورات">
          <TextField name="courses_eyebrow" label="السطر التمهيدي" defaultValue={str("courses_eyebrow")} />
          <TextField name="courses_heading" label="العنوان" defaultValue={str("courses_heading")} />
          <AreaField name="courses_subhead" label="العنوان الفرعي" defaultValue={str("courses_subhead")} rows={2} />
          <TextField name="courses_view_all_label" label="نص زر «عرض الكل»" defaultValue={str("courses_view_all_label")} />
        </Section>

        <Section title="قسم كيف تبدأ">
          <TextField name="how_heading" label="العنوان" defaultValue={str("how_heading")} />
          <AreaField name="how_subhead" label="العنوان الفرعي" defaultValue={str("how_subhead")} rows={2} />
        </Section>

        <Section title="قسم المكتسبات">
          <TextField name="outcomes_heading" label="العنوان" defaultValue={str("outcomes_heading")} />
          <AreaField name="outcomes_subhead" label="العنوان الفرعي" defaultValue={str("outcomes_subhead")} rows={2} />
        </Section>

        <Section title="قسم آراء المتدربين">
          <TextField name="testimonials_eyebrow" label="السطر التمهيدي" defaultValue={str("testimonials_eyebrow")} />
          <TextField name="testimonials_heading" label="العنوان" defaultValue={str("testimonials_heading")} />
        </Section>

        <Section title="قسم الأسئلة الشائعة">
          <TextField name="faq_eyebrow" label="السطر التمهيدي" defaultValue={str("faq_eyebrow")} />
          <TextField name="faq_heading" label="العنوان" defaultValue={str("faq_heading")} />
          <TextField name="faq_help_text" label="نص المساعدة" defaultValue={str("faq_help_text")} help="يظهر قبل رابط «تواصل معنا»" />
          <TextField name="faq_help_cta_label" label="نص رابط التواصل" defaultValue={str("faq_help_cta_label")} />
        </Section>

        <Section title="قسم المدونة">
          <TextField name="blog_heading" label="العنوان" defaultValue={str("blog_heading")} />
          <AreaField name="blog_subhead" label="العنوان الفرعي" defaultValue={str("blog_subhead")} rows={2} />
          <TextField name="blog_view_all_label" label="نص زر «عرض الكل»" defaultValue={str("blog_view_all_label")} />
        </Section>

        <Section title="الرؤية">
          <AreaField name="vision_text" label="نص الرؤية" defaultValue={str("vision_text")} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="vision_cta_label" label="زر الرؤية — النص" defaultValue={str("vision_cta_label")} />
            <TextField name="vision_cta_url" label="زر الرؤية — الرابط" defaultValue={str("vision_cta_url")} dir="ltr" />
          </div>
        </Section>

        <Section title="الدعوة النهائية (Final CTA)">
          <TextField name="final_cta_heading" label="العنوان" defaultValue={str("final_cta_heading")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="final_cta_primary_label" label="زر رئيسي — النص" defaultValue={str("final_cta_primary_label")} />
            <TextField name="final_cta_primary_url" label="زر رئيسي — الرابط" defaultValue={str("final_cta_primary_url")} dir="ltr" />
            <TextField name="final_cta_secondary_label" label="زر ثانوي — النص" defaultValue={str("final_cta_secondary_label")} />
            <TextField name="final_cta_secondary_url" label="زر ثانوي — الرابط" defaultValue={str("final_cta_secondary_url")} dir="ltr" />
          </div>
        </Section>

        <Section title="من نحن والتواصل">
          <MarkdownField name="about_body" label="نبذة (about)" defaultValue={str("about_body")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="whatsapp_number" label="رقم واتساب" defaultValue={str("whatsapp_number")} dir="ltr" placeholder="9665xxxxxxxx" />
            <TextField name="contact_email" label="البريد الإلكتروني" defaultValue={str("contact_email")} type="email" dir="ltr" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="social_facebook" label="فيسبوك" defaultValue={social.facebook ?? ""} dir="ltr" />
            <TextField name="social_tiktok" label="تيك توك" defaultValue={social.tiktok ?? ""} dir="ltr" />
            <TextField name="social_snapchat" label="سناب شات" defaultValue={social.snapchat ?? ""} dir="ltr" />
            <TextField name="social_telegram" label="تيليجرام" defaultValue={social.telegram ?? ""} dir="ltr" />
            <TextField name="social_youtube" label="يوتيوب" defaultValue={social.youtube ?? ""} dir="ltr" />
            <TextField name="social_twitter" label="تويتر / X" defaultValue={social.twitter ?? ""} dir="ltr" />
            <TextField name="social_instagram" label="إنستجرام" defaultValue={social.instagram ?? ""} dir="ltr" />
          </div>
        </Section>

        <div className="sticky bottom-0 -mx-6 border-t border-border bg-surface/80 px-6 py-4 backdrop-blur">
          <Button type="submit">حفظ الإعدادات</Button>
        </div>
      </form>
    </>
  );
}
