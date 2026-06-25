/**
 * Public Supabase env, safe to read on the client (NEXT_PUBLIC_*).
 *
 * The service-role key is deliberately NOT exported here — it lives only in
 * `lib/supabase/admin.ts`, which is marked `server-only` so it can never reach
 * the browser bundle.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Throw a clear error if the public Supabase env is missing. */
export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env missing. Copy .env.local.example to .env.local and fill " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your project.",
    );
  }
}
