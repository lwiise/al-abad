import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "./_components/sidebar";

// Admin is always live data — never statically cached.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Authoritative gate for every page in the panel.
  await requireAdmin();

  // The panel ground is `surface`; every container inside it is `bg-background`.
  // That pairing is 1.07:1 — the step CLAUDE.md calls below the threshold of
  // perception — so those containers each carry `shadow-sm`, matching the shared
  // `Card` primitive, which is the same white-on-tint card and always had one.
  // Without it the panel was a flat sheet subdivided by #e6e1ee hairlines and
  // nothing read as a distinct object. Dashed empty-state boxes are deliberately
  // left flat: a placeholder marks an absence, and lifting it off the page makes
  // "nothing here yet" look like a thing that is here.
  return (
    <div className="flex min-h-dvh bg-surface">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
