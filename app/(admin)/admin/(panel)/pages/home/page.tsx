import { ImageField } from "../../_components/fields";
import {
  AreaField,
  loadSettings,
  Section,
  SettingsForm,
  TextField,
} from "../../_components/settings-fields";

export const metadata = { title: "الصفحة الرئيسية" };

// Sections appear in the exact order they render on the public homepage.
export default async function HomePageSettings(props: {
  searchParams: Promise<{ saved?: string; error?: string; skipped?: string }>;
}) {
  const { saved, error, skipped } = await props.searchParams;
  const { bool, str, listVal } = await loadSettings();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">الصفحة الرئيسية</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          الأقسام مرتّبة بترتيب ظهورها في الموقع — اضغط على عنوان القسم لفتحه.
        </p>
      </header>

      <SettingsForm page="home" saved={saved} error={error} skipped={skipped}>
        <Section title="الشريط الترويجي">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="promo_enabled"
              defaultChecked={bool("promo_enabled")}
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

        <Section title="قسم التحديات">
          <TextField name="problem_heading" label="العنوان" defaultValue={str("problem_heading")} />
          <AreaField name="problem_subhead" label="العنوان الفرعي" defaultValue={str("problem_subhead")} rows={2} />
          <AreaField name="problem_points" label="نقاط المشكلة" defaultValue={listVal("problem_points")} help="سطر واحد لكل نقطة" rows={4} />
        </Section>

        <Section title="قسم المدرّب">
          <TextField name="instructor_eyebrow" label="السطر التمهيدي" defaultValue={str("instructor_eyebrow")} />
          <TextField name="instructor_name" label="الاسم / العنوان" defaultValue={str("instructor_name")} />
          <ImageField
            name="instructor_image_url"
            label="صورة المدرّب"
            defaultValue={str("instructor_image_url")}
            help="إن تُركت فارغة، تُستخدم صورة القسم الرئيسي"
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
          <AreaField name="outcome_points" label="نقاط النتائج" defaultValue={listVal("outcome_points")} help="سطر واحد لكل نقطة" rows={4} />
        </Section>

        <Section title="قسم الذكاء الاصطناعي">
          <TextField name="ai_badge" label="شارة القسم" defaultValue={str("ai_badge")} placeholder="قريباً" />
          <TextField name="ai_headline" label="العنوان" defaultValue={str("ai_headline")} />
          <AreaField name="ai_subhead" label="العنوان الفرعي" defaultValue={str("ai_subhead")} rows={2} />
          <AreaField name="ai_points" label="النقاط" defaultValue={listVal("ai_points")} help="تظهر كبطاقات عائمة حول المحادثة — سطر واحد لكل نقطة" rows={4} />
          <TextField name="ai_cta_label" label="نص الزر" defaultValue={str("ai_cta_label")} placeholder="انضم لقائمة الانتظار" />
          <TextField name="ai_note" label="ملاحظة تحت النموذج" defaultValue={str("ai_note")} help="طمأنة قصيرة عن البريد الإلكتروني" />
        </Section>

        <Section title="قسم آراء المتدربين">
          <TextField name="testimonials_eyebrow" label="شارة القسم" defaultValue={str("testimonials_eyebrow")} help="النص داخل الحبيبة أعلى القسم" />
          <TextField name="testimonials_heading" label="العنوان" defaultValue={str("testimonials_heading")} help="ضع «…» قبل الجزء الأخير ليُكتب بلون فاتح في سطرٍ مستقل" />
          <AreaField name="testimonials_subhead" label="العنوان الفرعي" defaultValue={str("testimonials_subhead")} rows={2} />
          <TextField name="testimonials_proof" label="سطر الثقة" defaultValue={str("testimonials_proof")} help="يظهر أسفل البطاقات قبل الزر" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="testimonials_cta_label" label="الزر — النص" defaultValue={str("testimonials_cta_label")} />
            <TextField name="testimonials_cta_url" label="الزر — الرابط" defaultValue={str("testimonials_cta_url")} dir="ltr" />
          </div>
        </Section>

        <Section title="قسم الأسئلة الشائعة">
          <TextField name="faq_eyebrow" label="السطر التمهيدي" defaultValue={str("faq_eyebrow")} />
          <TextField name="faq_heading" label="العنوان" defaultValue={str("faq_heading")} />
          <TextField name="faq_help_text" label="نص المساعدة" defaultValue={str("faq_help_text")} help="يظهر قبل رابط «تواصل معنا»" />
          <TextField name="faq_help_cta_label" label="نص رابط التواصل" defaultValue={str("faq_help_cta_label")} />
        </Section>

        <Section title="الدعوة النهائية (Final CTA)">
          <TextField name="final_cta_eyebrow" label="شارة الصدارة" defaultValue={str("final_cta_eyebrow")} help="النص الصغير أعلى البطاقة" />
          <TextField name="final_cta_heading" label="العنوان" defaultValue={str("final_cta_heading")} help="ضع «…» قبل الكلمة الأخيرة لتُكتب بخط الرقعة" />
          <AreaField name="final_cta_subhead" label="العنوان الفرعي" defaultValue={str("final_cta_subhead")} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="final_cta_primary_label" label="زر رئيسي — النص" defaultValue={str("final_cta_primary_label")} />
            <TextField name="final_cta_primary_url" label="زر رئيسي — الرابط" defaultValue={str("final_cta_primary_url")} dir="ltr" />
            <TextField name="final_cta_secondary_label" label="زر ثانوي — النص" defaultValue={str("final_cta_secondary_label")} />
            <TextField name="final_cta_secondary_url" label="زر ثانوي — الرابط" defaultValue={str("final_cta_secondary_url")} dir="ltr" />
          </div>
          <TextField name="final_cta_proof" label="سطر الثقة" defaultValue={str("final_cta_proof")} help="يظهر بجانب صور المتدربين أسفل البطاقة" />
        </Section>

        <Section title="قسم المدونة">
          <TextField name="blog_heading" label="العنوان" defaultValue={str("blog_heading")} />
          <AreaField name="blog_subhead" label="العنوان الفرعي" defaultValue={str("blog_subhead")} rows={2} />
          <TextField name="blog_view_all_label" label="نص زر «عرض الكل»" defaultValue={str("blog_view_all_label")} />
        </Section>
      </SettingsForm>
    </>
  );
}
