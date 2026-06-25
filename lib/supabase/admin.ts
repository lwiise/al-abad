import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client. BYPASSES RLS — use only in server actions and
 * route handlers for trusted admin reads/writes. `server-only` guarantees this
 * module (and the service key) never ships to the browser.
 *
 * Lazily constructed so the app can boot without the key set (only admin paths
 * actually need it).
 */
let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createAdminClient() {
  if (cached) return cached;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "Admin Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (service key is server-only).",
    );
  }

  cached = createSupabaseClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
