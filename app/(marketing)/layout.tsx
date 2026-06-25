import type { ReactNode } from "react";

// Public marketing shell. Real header/footer land in Phase 2; for now it just
// frames the placeholder home so the route group is wired and ready.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <main className="flex min-h-dvh flex-col">{children}</main>;
}
