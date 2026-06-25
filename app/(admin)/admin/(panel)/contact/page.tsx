import { adminDb } from "../../_lib/db";

export const metadata = { title: "الرسائل الواردة" };

export default async function ContactPage() {
  const { data } = await adminDb()
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">الرسائل الواردة</h1>
        <p className="text-sm text-foreground-muted">{rows.length} رسالة</p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-foreground-muted">
          لا توجد رسائل بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-foreground-subtle">
                <th className="px-4 py-3 text-start font-medium">الاسم</th>
                <th className="px-4 py-3 text-start font-medium">البريد</th>
                <th className="px-4 py-3 text-start font-medium">الرسالة</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 text-foreground">{String(r.name ?? "—")}</td>
                  <td dir="ltr" className="px-4 py-3 text-start text-foreground-muted">
                    {String(r.email ?? "—")}
                  </td>
                  <td className="max-w-md px-4 py-3 text-foreground-muted">{String(r.message ?? "")}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-foreground-subtle">
                    {r.created_at ? new Date(String(r.created_at)).toLocaleString("ar-SA") : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
