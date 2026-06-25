import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the Supabase auth session on every matched request and performs an
 * OPTIMISTIC redirect: unauthenticated users hitting /admin (except the login
 * page) are bounced to /admin/login. The authoritative admin-membership check
 * still happens server-side in `requireAdmin()` (defense in depth).
 *
 * In Next 16 this runs from `proxy.ts` under the Node.js runtime.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If env is not configured yet, don't crash the whole app — let requests
  // through; data/admin pages will surface a clear error when they query.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, sameSite: "lax" }),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdminArea && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
