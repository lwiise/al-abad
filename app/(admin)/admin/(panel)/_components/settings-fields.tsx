import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminDb } from "../../_lib/db";
import { saveSettings, type SettingsPage } from "../../_lib/actions";

/**
 * Shared building blocks for the per-page site editors (/admin/pages/*).
 * All server components — the collapse behaviour is native <details>, which
 * (unlike the Radix Accordion) keeps closed sections in the DOM so their
 * inputs still submit with the form.
 */

export async function loadSettings() {
  const { data } = await adminDb().from("site_settings").select("*").limit(1).maybeSingle();
  const s = (data ?? {}) as Record<string, unknown>;
  return {
    raw: s,
    str: (k: string) => (s[k] == null ? "" : String(s[k])),
    bool: (k: string) => Boolean(s[k]),
    listVal: (k: string) => (Array.isArray(s[k]) ? (s[k] as string[]).join("\n") : ""),
    social: (s.social_links ?? {}) as Record<string, string>,
  };
}

/** Collapsible section — closed by default, only the title shows. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-border bg-background">
      <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-3 rounded-xl px-6 py-4 text-sm font-bold text-primary transition-colors hover:bg-surface [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 shrink-0 text-foreground-subtle transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border p-6">{children}</div>
    </details>
  );
}

export function TextField({
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

export function AreaField({
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

/** Form shell: posts to saveSettings for one page, with the sticky save bar. */
export function SettingsForm({
  page,
  saved,
  error,
  children,
}: {
  page: SettingsPage;
  saved?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={saveSettings} encType="multipart/form-data" className="space-y-4">
      <input type="hidden" name="page" value={page} />
      {children}
      <div className="sticky bottom-0 -mx-6 flex items-center gap-3 border-t border-border bg-surface/80 px-6 py-4 backdrop-blur">
        <Button type="submit">حفظ التغييرات</Button>
        {saved && (
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
            تم الحفظ ✓
          </span>
        )}
        {error && (
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent-strong">
            تعذّر الحفظ: {error}
          </span>
        )}
      </div>
    </form>
  );
}
