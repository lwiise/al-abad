import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "./_components/sidebar";

// Admin is always live data — never statically cached.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Authoritative gate for every page in the panel.
  await requireAdmin();

  return (
    <div className="flex min-h-dvh bg-surface">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
