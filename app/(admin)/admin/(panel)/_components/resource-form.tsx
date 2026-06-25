import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveResource } from "../../_lib/actions";
import type { FieldDef, ResourceDef } from "../../_lib/resources";
import { ImageField, MarkdownField } from "./fields";

function toDatetimeLocal(value: unknown): string {
  if (!value || typeof value !== "string") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function FieldRow({
  field,
  value,
  isNew,
}: {
  field: FieldDef;
  value: unknown;
  isNew: boolean;
}) {
  const str = value == null ? "" : String(value);

  switch (field.type) {
    case "boolean":
      return (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={isNew ? field.name === "is_published" : Boolean(value)}
            className="size-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-foreground">{field.label}</span>
          {field.help && <span className="text-xs text-foreground-subtle">— {field.help}</span>}
        </label>
      );

    case "markdown":
      return (
        <MarkdownField
          name={field.name}
          label={field.label}
          defaultValue={str}
          help={field.help}
          required={field.required}
        />
      );

    case "image":
      return (
        <ImageField name={field.name} label={field.label} defaultValue={str} help={field.help} />
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.name} required={field.required}>
            {field.label}
          </Label>
          <Textarea
            id={field.name}
            name={field.name}
            defaultValue={str}
            required={field.required}
            placeholder={field.placeholder}
          />
          {field.help && <p className="text-xs text-foreground-subtle">{field.help}</p>}
        </div>
      );

    default: {
      const inputType =
        field.type === "number"
          ? "number"
          : field.type === "datetime"
            ? "datetime-local"
            : field.type === "url"
              ? "url"
              : "text";
      const defaultValue = field.type === "datetime" ? toDatetimeLocal(value) : str;
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.name} required={field.required}>
            {field.label}
          </Label>
          <Input
            id={field.name}
            name={field.name}
            type={inputType}
            step={field.type === "number" ? "any" : undefined}
            dir={field.type === "url" ? "ltr" : undefined}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder}
          />
          {field.help && <p className="text-xs text-foreground-subtle">{field.help}</p>}
        </div>
      );
    }
  }
}

export function ResourceForm({
  resource,
  record,
}: {
  resource: ResourceDef;
  record?: Record<string, unknown> | null;
}) {
  const id = (record?.id as string | undefined) ?? null;
  const isNew = !id;
  const action = saveResource.bind(null, resource.key, id);

  return (
    <form action={action} encType="multipart/form-data" className="space-y-6">
      {resource.fields.map((field) => (
        <FieldRow key={field.name} field={field} value={record?.[field.name]} isNew={isNew} />
      ))}

      <div className="flex gap-3 pt-2">
        <Button type="submit">حفظ</Button>
        <Link href={`/admin/${resource.key}`} className={buttonClasses("outline")}>
          إلغاء
        </Link>
      </div>
    </form>
  );
}
