import {
  AreaField,
  loadSettings,
  Section,
  SettingsForm,
  TextField,
} from "../../_components/settings-fields";

export const metadata = { title: "صفحة التواصل" };

export default async function ContactPageSettings(props: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await props.searchParams;
  const { str, social } = await loadSettings();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">صفحة التواصل</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          بيانات التواصل والروابط تظهر أيضاً في تذييل الموقع.
        </p>
      </header>

      <SettingsForm page="contact" saved={saved} error={error}>
        <Section title="ترويسة الصفحة">
          <TextField name="contact_heading" label="العنوان" defaultValue={str("contact_heading")} placeholder="تواصل معنا" />
          <AreaField name="contact_subhead" label="العنوان الفرعي" defaultValue={str("contact_subhead")} rows={2} />
        </Section>

        <Section title="بيانات التواصل">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="whatsapp_number" label="رقم واتساب" defaultValue={str("whatsapp_number")} dir="ltr" placeholder="9665xxxxxxxx" />
            <TextField name="contact_email" label="البريد الإلكتروني" defaultValue={str("contact_email")} type="email" dir="ltr" />
          </div>
        </Section>

        <Section title="روابط التواصل الاجتماعي">
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
      </SettingsForm>
    </>
  );
}
