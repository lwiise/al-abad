import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next 16 renamed `middleware` → `proxy` (Node.js runtime). This refreshes the
// Supabase session and optimistically guards the /admin area.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on /admin routes (auth gate + session refresh) and skip static
     * assets. Adjust if marketing pages later need per-request session data.
     */
    "/admin/:path*",
  ],
};
