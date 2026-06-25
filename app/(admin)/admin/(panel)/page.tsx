import Link from "next/link";
import { RESOURCES } from "../_lib/resources";
import { adminDb } from "../_lib/db";

export const metadata = { title: "الرئيسية" };

async function countOf(table: string): Promise<number> {
  const { count } = await adminDb().from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function DashboardPage() {
  const [resourceCounts, waitlistCount, contactRows] = await Promise.all([
    Promise.all(
      RESOURCES.map(async (r) => ({
        key: r.key,
        label: r.label,
        count: await countOf(r.table),
      })),
    ),
    countOf("ai_waitlist"),
    adminDb()
      .from("contact_submissions")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const contacts = (contactRows.data ?? []) as Record<string, unknown>[];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-foreground-muted">نظرة عامة على المحتوى والوارد</p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {resourceCounts.map((r) => (
          <Link
            key={r.key}
            href={`/admin/${r.key}`}
            className="rounded-xl border border-border bg-background p-5 transition-colors hover:border-border-strong"
          >
            <p className="text-3xl font-bold text-foreground">{r.count}</p>
            <p className="mt-1 text-sm text-foreground-muted">{r.label}</p>
          </Link>
        ))}
        <Link
          href="/admin/waitlist"
          className="rounded-xl border border-highlight/30 bg-highlight/5 p-5 transition-colors hover:border-highlight/50"
        >
          <p className="text-3xl font-bold text-highlight">{waitlistCount}</p>
          <p className="mt-1 text-sm text-foreground-muted">قائمة انتظار AI</p>
        </Link>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">أحدث الرسائل</h2>
          <Link href="/admin/contact" className="text-sm text-primary hover:text-primary-hover">
            عرض الكل
          </Link>
        </div>

        {contacts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-foreground-muted">
            لا توجد رسائل بعد.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-background">
            {contacts.map((c) => (
              <li key={String(c.id)} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{String(c.name ?? "—")}</p>
                  <span className="text-xs text-foreground-subtle">
                    {c.created_at ? new Date(String(c.created_at)).toLocaleDateString("ar-SA") : ""}
                  </span>
                </div>
                {c.email ? (
                  <p dir="ltr" className="text-start text-xs text-foreground-subtle">{String(c.email)}</p>
                ) : null}
                <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">{String(c.message ?? "")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
