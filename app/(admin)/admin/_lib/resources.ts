import type { Database } from "@/lib/database.types";

export type TableName = keyof Database["public"]["Tables"];

export type FieldType =
  | "text"
  | "url"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "image"
  | "datetime";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
}

export interface ResourceDef {
  key: string; // URL segment under /admin
  table: TableName;
  label: string; // Arabic plural (nav + headings)
  singular: string; // Arabic singular (buttons)
  fields: FieldDef[];
  listColumns: string[]; // field names shown in the table
  sortable: boolean; // has sort_order → reorder controls
  publishable: boolean; // has is_published
  orderBy: { column: string; ascending: boolean };
}

const isPublished: FieldDef = {
  name: "is_published",
  label: "منشور",
  type: "boolean",
  help: "إظهار هذا العنصر في الموقع العام",
};

export const RESOURCES: ResourceDef[] = [
  {
    key: "courses",
    table: "courses",
    label: "الدورات",
    singular: "دورة",
    sortable: true,
    publishable: true,
    orderBy: { column: "sort_order", ascending: true },
    listColumns: ["title", "category", "price", "is_published"],
    fields: [
      { name: "title", label: "العنوان", type: "text", required: true },
      {
        name: "slug",
        label: "المُعرّف (slug)",
        type: "text",
        required: true,
        help: "فريد، بالإنجليزية وبدون مسافات — يُستخدم في الرابط",
      },
      { name: "subtitle", label: "العنوان الفرعي", type: "text" },
      { name: "category", label: "التصنيف", type: "text" },
      { name: "price", label: "السعر", type: "number" },
      { name: "currency", label: "العملة", type: "text", placeholder: "SAR" },
      { name: "cta_url", label: "رابط التسجيل / الشراء", type: "url" },
      { name: "hero_image_url", label: "صورة الغلاف", type: "image" },
      { name: "description", label: "الوصف", type: "markdown" },
      isPublished,
    ],
  },
  {
    key: "blog",
    table: "blog_posts",
    label: "المدونة",
    singular: "مقال",
    sortable: false,
    publishable: true,
    orderBy: { column: "published_at", ascending: false },
    listColumns: ["title", "published_at", "is_published"],
    fields: [
      { name: "title", label: "العنوان", type: "text", required: true },
      {
        name: "slug",
        label: "المُعرّف (slug)",
        type: "text",
        required: true,
        help: "فريد، بالإنجليزية وبدون مسافات",
      },
      { name: "excerpt", label: "المقتطف", type: "textarea" },
      { name: "cover_image_url", label: "صورة الغلاف", type: "image" },
      { name: "published_at", label: "تاريخ النشر", type: "datetime" },
      { name: "body", label: "المحتوى", type: "markdown" },
      isPublished,
    ],
  },
  {
    key: "testimonials",
    table: "testimonials",
    label: "آراء المتدربين",
    singular: "رأي",
    sortable: true,
    publishable: true,
    orderBy: { column: "sort_order", ascending: true },
    listColumns: ["author_name", "author_title", "is_published"],
    fields: [
      { name: "author_name", label: "الاسم", type: "text", required: true },
      { name: "author_title", label: "الصفة", type: "text" },
      { name: "quote", label: "الرأي", type: "textarea", required: true },
      { name: "avatar_url", label: "الصورة الشخصية", type: "image" },
      isPublished,
    ],
  },
  {
    key: "faqs",
    table: "faqs",
    label: "الأسئلة الشائعة",
    singular: "سؤال",
    sortable: true,
    publishable: true,
    orderBy: { column: "sort_order", ascending: true },
    listColumns: ["question", "is_published"],
    fields: [
      { name: "question", label: "السؤال", type: "text", required: true },
      { name: "answer", label: "الإجابة", type: "markdown" },
      isPublished,
    ],
  },
  {
    key: "stats",
    table: "stats",
    label: "الأرقام",
    singular: "رقم",
    sortable: true,
    publishable: true,
    orderBy: { column: "sort_order", ascending: true },
    listColumns: ["label", "value", "is_published"],
    fields: [
      { name: "label", label: "العنوان", type: "text", required: true },
      { name: "value", label: "القيمة", type: "text", required: true, placeholder: "+15" },
      isPublished,
    ],
  },
  {
    key: "how-it-works",
    table: "how_it_works_steps",
    label: "كيف تعمل",
    singular: "خطوة",
    sortable: true,
    publishable: true,
    orderBy: { column: "sort_order", ascending: true },
    listColumns: ["title", "is_published"],
    fields: [
      { name: "title", label: "العنوان", type: "text", required: true },
      { name: "description", label: "الوصف", type: "textarea" },
      isPublished,
    ],
  },
];

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key);
}

/** Human label for a column in list/detail views. */
export function columnLabel(resource: ResourceDef, column: string): string {
  if (column === "published_at") return "تاريخ النشر";
  return resource.fields.find((f) => f.name === column)?.label ?? column;
}
