"use client";

import { useRef, useState, type ChangeEvent } from "react";
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

/**
 * Downscale + re-encode an image in the browser so uploads stay small (a few
 * hundred KB) no matter how large the original. Keeps admin uploads well under
 * the Server Action body limit and Netlify's function payload cap, and ships
 * lighter images to the public site. Returns the original on any failure or if
 * re-encoding wouldn't shrink it. Animated/vector formats are left untouched.
 */
async function downscaleImage(file: File, maxEdge = 1600, quality = 0.82): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // flatten transparency — JPEG has no alpha channel
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file; // no gain → keep original
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
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
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const optimized = await downscaleImage(file);
      // Swap the compressed file back into the input so the form submits it.
      // Setting input.files programmatically does NOT re-fire onChange.
      if (optimized !== file && inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(optimized);
        inputRef.current.files = dt.files;
      }
      setPreview(URL.createObjectURL(optimized));
    } finally {
      setBusy(false);
    }
  }

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
        ref={inputRef}
        type="file"
        accept="image/*"
        name={`${name}__file`}
        onChange={handleChange}
        className={cn(
          fieldClasses,
          "file:me-3 file:rounded-md file:border-0 file:bg-surface-strong file:px-3 file:py-1 file:text-sm file:text-primary",
        )}
      />
      {/* Persist the existing URL when no new file is chosen. */}
      <input type="hidden" name={name} defaultValue={defaultValue ?? ""} />
      {busy && <p className="text-xs text-foreground-subtle">جارٍ تحسين الصورة…</p>}
      {help && <p className="text-xs text-foreground-subtle">{help}</p>}
    </div>
  );
}
