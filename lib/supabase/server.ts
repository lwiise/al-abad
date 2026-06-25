import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Reads/writes the auth session via cookies. Runs under the `anon` role and is
 * therefore subject to RLS — use it for the signed-in user, not admin writes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, { ...options, sameSite: "lax" });
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // The session refresh in proxy.ts keeps cookies fresh, so ignore.
        }
      },
    },
  });
}
