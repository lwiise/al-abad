import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** The currently signed-in Supabase user, or null. Deduped per request. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Env not configured / network error → treat as signed-out so admin routes
    // redirect to /admin/login rather than 500.
    return null;
  }
});

/** True if the given auth user id has a row in admin_users. */
export const isAdminUser = cache(async (userId: string): Promise<boolean> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
});

/**
 * Authoritative guard for the admin panel. Returns the admin user, or redirects
 * to /admin/login. Call at the top of every protected admin page/layout.
 */
export const requireAdmin = cache(async (): Promise<User> => {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const ok = await isAdminUser(user.id);
  if (!ok) redirect("/admin/login?error=forbidden");
  return user;
});
