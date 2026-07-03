import { MarkdownField } from "../../_components/fields";
import {
  AreaField,
  loadSettings,
  Section,
  SettingsForm,
  TextField,
} from "../../_components/settings-fields";

export const metadata = { title: "صفحة من نحن" };

export default async function AboutPageSettings(props: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await props.searchParams;
  const { str } = await loadSettings();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">صفحة من نحن</h1>
      </header>

      <SettingsForm page="about" saved={saved} error={error}>
        <Section title="النبذة">
          <MarkdownField name="about_body" label="نبذة (about)" defaultValue={str("about_body")} />
        </Section>

        <Section title="الرؤية">
          <AreaField name="vision_text" label="نص الرؤية" defaultValue={str("vision_text")} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="vision_cta_label" label="زر الرؤية — النص" defaultValue={str("vision_cta_label")} />
            <TextField name="vision_cta_url" label="زر الرؤية — الرابط" defaultValue={str("vision_cta_url")} dir="ltr" />
          </div>
        </Section>
      </SettingsForm>
    </>
  );
}
