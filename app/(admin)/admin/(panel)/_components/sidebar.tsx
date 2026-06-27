"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RESOURCES } from "../../_lib/resources";
import { signOut } from "../../_lib/actions";

const extraLinks = [
  { href: "/admin/settings", label: "إعدادات الموقع" },
  { href: "/admin/contact", label: "الرسائل الواردة" },
  { href: "/admin/waitlist", label: "قائمة انتظار الذكاء الاصطناعي" },
];

function NavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-on-primary"
          : "text-foreground-muted hover:bg-surface-strong hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

/**
 * Non-clickable section header. Deliberately styled unlike NavLink — smaller,
 * lighter, with a divider rule — so it never reads as a tappable item.
 */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 mb-1 select-none border-t border-border px-3 pt-4 text-[0.6875rem] font-semibold text-foreground-subtle/70">
      {children}
    </p>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-e border-border bg-background">
      <div className="px-5 py-6">
        <p className="text-lg font-bold text-foreground">لوحة التحكم</p>
        <p className="text-xs text-foreground-subtle">الأستاذ علي العباد</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <NavLink href="/admin" label="الرئيسية" exact />

        <GroupLabel>المحتوى</GroupLabel>
        {RESOURCES.map((r) => (
          <NavLink key={r.key} href={`/admin/${r.key}`} label={r.label} />
        ))}

        <GroupLabel>الإعدادات والوارد</GroupLabel>
        {extraLinks.map((l) => (
          <NavLink key={l.href} href={l.href} label={l.label} />
        ))}
      </nav>

      <form action={signOut} className="border-t border-border p-3">
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-right text-sm text-foreground-muted transition-colors hover:bg-surface-strong hover:text-foreground"
        >
          تسجيل الخروج
        </button>
      </form>
    </aside>
  );
}
