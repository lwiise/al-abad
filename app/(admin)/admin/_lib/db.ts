import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Untyped service-role client for DYNAMIC table reads in the admin panel
 * (table/column names come from the resource config). The strongly-typed
 * client fights dynamic table names, so we deliberately drop the schema
 * generic here. Always used behind requireAdmin().
 */
export function adminDb(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}
