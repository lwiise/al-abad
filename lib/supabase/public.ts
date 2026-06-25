import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cookieless anon client for PUBLIC marketing reads. Because it never touches
 * cookies()/headers(), pages that use it can be statically rendered / ISR'd.
 * Still runs under the `anon` role, so RLS only exposes published content.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function createPublicClient() {
  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
