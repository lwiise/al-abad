"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Label } from "@/components/ui/label";
import { Textarea, fieldClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MarkdownField({
  name,
  label,
  defaultValue,
  help,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  help?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="text-xs font-medium text-primary hover:text-primary-hover"
        >
          {preview ? "تحرير" : "معاينة"}
        </button>
      </div>

      {preview ? (
        <>
          <div className="min-h-[10rem] space-y-2 rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h2]:font-bold [&_a]:text-primary [&_ul]:list-disc [&_ul]:pe-5 [&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:ps-3 [&_blockquote]:text-foreground-muted">
            <ReactMarkdown>{value || "_لا يوجد محتوى بعد_"}</ReactMarkdown>
          </div>
          <input type="hidden" name={name} value={value} />
        </>
      ) : (
        <Textarea
          id={name}
          name={name}
          rows={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
        />
      )}
      {help && <p className="text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}

export function ImageField({
  name,
  label,
  defaultValue,
  help,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  help?: string;
}) {
  const [preview, setPreview] = useState(defaultValue ?? "");

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {preview && (
        // Blob/remote preview — next/image can't optimise a blob URL here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-28 w-28 rounded-lg border border-border object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        name={`${name}__file`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPreview(URL.createObjectURL(file));
        }}
        className={cn(
          fieldClasses,
          "file:me-3 file:rounded-md file:border-0 file:bg-surface-strong file:px-3 file:py-1 file:text-sm file:text-primary",
        )}
      />
      {/* Persist the existing URL when no new file is chosen. */}
      <input type="hidden" name={name} defaultValue={defaultValue ?? ""} />
      {help && <p className="text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}
