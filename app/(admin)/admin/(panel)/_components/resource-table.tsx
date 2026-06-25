import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { columnLabel, type ResourceDef } from "../../_lib/resources";
import { deleteResource, reorderResource, togglePublish } from "../../_lib/actions";
import { ConfirmButton } from "./row-actions";

const iconBtn =
  "rounded-md px-2 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-strong hover:text-foreground disabled:opacity-40";

function renderCell(column: string, row: Record<string, unknown>) {
  const v = row[column];
  if (column === "is_published") {
    return (
      <Badge tone={v ? "published" : "draft"}>{v ? "منشور" : "مسودة"}</Badge>
    );
  }
  if (column === "published_at") {
    return v ? new Date(String(v)).toLocaleDateString("ar-SA") : "—";
  }
  if (column === "price") {
    return v != null && v !== "" ? `${String(v)} ${String(row.currency ?? "")}` : "—";
  }
  return v ? String(v) : "—";
}

export function ResourceTable({
  resource,
  rows,
}: {
  resource: ResourceDef;
  rows: Record<string, unknown>[];
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-foreground-muted">
        لا توجد عناصر بعد.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-start text-foreground-subtle">
            {resource.listColumns.map((c) => (
              <th key={c} className="px-4 py-3 text-start font-medium">
                {columnLabel(resource, c)}
              </th>
            ))}
            <th className="px-4 py-3 text-end font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = String(row.id);
            const published = Boolean(row.is_published);
            return (
              <tr key={id} className="border-b border-border last:border-0">
                {resource.listColumns.map((c) => (
                  <td
                    key={c}
                    className="max-w-[22rem] truncate px-4 py-3 text-foreground"
                  >
                    {renderCell(c, row)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {resource.sortable && (
                      <>
                        <form action={reorderResource.bind(null, resource.key, id, "up")}>
                          <button className={iconBtn} title="أعلى" type="submit">
                            ▲
                          </button>
                        </form>
                        <form action={reorderResource.bind(null, resource.key, id, "down")}>
                          <button className={iconBtn} title="أسفل" type="submit">
                            ▼
                          </button>
                        </form>
                      </>
                    )}

                    <Link href={`/admin/${resource.key}/${id}`} className={iconBtn}>
                      تحرير
                    </Link>

                    {resource.publishable && (
                      <form action={togglePublish.bind(null, resource.key, id, published)}>
                        <button className={iconBtn} type="submit">
                          {published ? "إخفاء" : "نشر"}
                        </button>
                      </form>
                    )}

                    <form action={deleteResource.bind(null, resource.key, id)}>
                      <ConfirmButton
                        message="حذف هذا العنصر نهائياً؟"
                        className={iconBtn + " text-accent hover:text-accent-hover"}
                      >
                        حذف
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
