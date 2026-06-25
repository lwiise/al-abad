#!/usr/bin/env node
/**
 * One-off: create the owner admin user.
 *
 *   node scripts/create-admin.mjs <email> <password>
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the
 * environment, falling back to parsing .env.local. Creates the auth user
 * (email pre-confirmed) and adds a row to admin_users. Safe to re-run: if the
 * user already exists it just (re)sets the password and ensures the admin row.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.mjs <email> <password>");
    process.exit(1);
  }

  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    // Likely already registered — find the user and reset the password.
    console.warn(`createUser: ${createErr.message} — looking up existing user…`);
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) throw createErr;
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
    console.log(`Updated password for existing user ${email}.`);
  } else {
    userId = created.user.id;
    console.log(`Created auth user ${email}.`);
  }

  const { error: adminErr } = await supabase
    .from("admin_users")
    .upsert({ user_id: userId, role: "owner" }, { onConflict: "user_id" });
  if (adminErr) throw adminErr;

  console.log(`✓ ${email} is now an admin. Sign in at /admin/login`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
