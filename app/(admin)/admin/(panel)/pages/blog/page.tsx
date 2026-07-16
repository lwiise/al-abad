import Link from "next/link";
import {
  AreaField,
  loadSettings,
  Section,
  SettingsForm,
  TextField,
} from "../../_components/settings-fields";

export const metadata = { title: "صفحة المدونة" };

export default async function BlogPageSettings(props: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await props.searchParams;
  const { str } = await loadSettings();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">صفحة المدونة</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          المقالات نفسها تُدار من قسم{" "}
          <Link href="/admin/blog" className="text-primary hover:text-primary-hover">
            المدونة
          </Link>{" "}
          في المحتوى.
        </p>
      </header>

      <SettingsForm page="blog" saved={saved} error={error}>
        <Section title="ترويسة الصفحة">
          <TextField name="blog_page_heading" label="العنوان" defaultValue={str("blog_page_heading")} placeholder="المدونة" />
          <AreaField name="blog_page_subhead" label="العنوان الفرعي" defaultValue={str("blog_page_subhead")} rows={2} />
        </Section>
      </SettingsForm>
    </>
  );
}
