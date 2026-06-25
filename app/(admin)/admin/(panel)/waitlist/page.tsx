import { buttonClasses } from "@/components/ui/button";
import { adminDb } from "../../_lib/db";
import { deleteWaitlistEntry } from "../../_lib/actions";
import { ConfirmButton } from "../_components/row-actions";

export const metadata = { title: "قائمة انتظار الذكاء الاصطناعي" };

export default async function WaitlistPage() {
  const { data } = await adminDb()
    .from("ai_waitlist")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">قائمة انتظار الذكاء الاصطناعي</h1>
          <p className="text-sm text-foreground-muted">{rows.length} مشترك</p>
        </div>
        {rows.length > 0 && (
          // Route handler that streams a CSV download — must be a full <a>, not <Link>.
          <a href="/admin/waitlist/export" className={buttonClasses("outline", "sm")} download>
            تصدير CSV
          </a>
        )}
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-foreground-muted">
          لا يوجد مشتركون بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-foreground-subtle">
                <th className="px-4 py-3 text-start font-medium">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-start font-medium">تاريخ الاشتراك</th>
                <th className="px-4 py-3 text-end font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-b border-border last:border-0">
                  <td dir="ltr" className="px-4 py-3 text-start text-foreground">{String(r.email)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-foreground-subtle">
                    {r.created_at ? new Date(String(r.created_at)).toLocaleString("ar-SA") : ""}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <form action={deleteWaitlistEntry.bind(null, String(r.id))}>
                      <ConfirmButton
                        message="حذف هذا الاشتراك؟"
                        className="rounded-md px-2 py-1 text-xs text-accent transition-colors hover:bg-surface-strong"
                      >
                        حذف
                      </ConfirmButton>
                    </form>
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
