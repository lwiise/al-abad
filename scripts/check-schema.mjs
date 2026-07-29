#!/usr/bin/env node
/**
 * ============================================================================
 * Schema drift audit — supabase/full_setup.sql vs supabase/migrations/*.sql
 * ============================================================================
 *
 * `full_setup.sql` is the flattened, one-paste equivalent of the migration
 * folder — it is what an owner actually runs against a hosted project. Nothing
 * enforced that the two agreed, so 0003, 0005 and 0006 silently never got
 * folded in, and the admin panel's الرئيسية / المدونة / التواصل editors could
 * not save at all: PostgREST rejects a write naming a column the table lacks
 * (PGRST204), and it rejects the WHOLE row, so one stale column takes down a
 * whole editor page.
 *
 * This compares the two sides structurally — tables and columns, not
 * formatting — and fails on anything the flattened file is missing. Seed
 * content is deliberately out of scope: full_setup carries starter rows,
 * seed_homepage.sql carries the homepage copy, and they are allowed to differ.
 *
 * Run: pnpm check-schema
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");
const flattenedPath = join(root, "supabase", "full_setup.sql");

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

// Table-level constraint keywords that lead a line inside `create table (…)`
// and must not be mistaken for column names.
const NOT_A_COLUMN = new Set([
  "primary",
  "unique",
  "constraint",
  "foreign",
  "check",
  "exclude",
  "like",
]);

function stripComments(sql) {
  return sql.replace(/--[^\n]*/g, "");
}

/**
 * → Map<table, Set<column>> for one SQL file. Understands the two shapes these
 * files use: `create table if not exists public.x (…)` and
 * `alter table public.x add column if not exists y …`.
 */
function parseSchema(sql) {
  const clean = stripComments(sql);
  const tables = new Map();
  const add = (table, column) => {
    if (!tables.has(table)) tables.set(table, new Set());
    tables.get(table).add(column);
  };

  for (const m of clean.matchAll(
    /create table\s+(?:if not exists\s+)?public\.(\w+)\s*\(([\s\S]*?)\n\s*\);/gi,
  )) {
    const [, table, body] = m;
    if (!tables.has(table)) tables.set(table, new Set());
    // Split on top-level commas so `numeric(10, 2)` stays one column.
    let depth = 0;
    let current = "";
    const parts = [];
    for (const ch of body) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(current);
        current = "";
      } else current += ch;
    }
    parts.push(current);

    for (const part of parts) {
      const name = /^\s*([a-z_][a-z0-9_]*)\s+\S/i.exec(part)?.[1];
      if (name && !NOT_A_COLUMN.has(name.toLowerCase())) add(table, name.toLowerCase());
    }
  }

  for (const m of clean.matchAll(/alter table\s+(?:only\s+)?public\.(\w+)([\s\S]*?);/gi)) {
    const [, table, body] = m;
    for (const c of body.matchAll(/add column\s+(?:if not exists\s+)?([a-z_][a-z0-9_]*)/gi)) {
      add(table, c[1].toLowerCase());
    }
  }

  return tables;
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const expected = new Map();
for (const file of migrationFiles) {
  for (const [table, columns] of parseSchema(readFileSync(join(migrationsDir, file), "utf8"))) {
    if (!expected.has(table)) expected.set(table, new Set());
    for (const c of columns) expected.get(table).add(c);
  }
}

const actual = parseSchema(readFileSync(flattenedPath, "utf8"));

const problems = [];
for (const [table, columns] of [...expected].sort()) {
  const have = actual.get(table);
  if (!have) {
    problems.push(`table \`${table}\` is missing entirely (${columns.size} columns)`);
    continue;
  }
  const missing = [...columns].filter((c) => !have.has(c)).sort();
  if (missing.length) {
    problems.push(`table \`${table}\` is missing: ${missing.join(", ")}`);
  }
}

console.log(
  `Comparing supabase/full_setup.sql against ${migrationFiles.length} migration(s):\n` +
    `  ${migrationFiles.join("\n  ")}\n`,
);

if (problems.length) {
  console.error("✗ supabase/full_setup.sql has drifted from the migrations.\n");
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nFold the missing DDL into supabase/full_setup.sql (add-if-not-exists, so it\n" +
      "stays safe to re-run), then run this again. A column the admin panel writes\n" +
      "but the database lacks makes PostgREST reject the entire row.\n",
  );
  process.exit(1);
}

const tableCount = expected.size;
const columnCount = [...expected.values()].reduce((n, s) => n + s.size, 0);
console.log(`✓ full_setup.sql covers all ${tableCount} tables / ${columnCount} columns.`);

// ---------------------------------------------------------------------------
// Second check: every column the admin settings action writes must exist.
// This is the actual failure path — saveSettings builds its payload by hand, so
// a field added to the form without a migration only shows up at save time.
// ---------------------------------------------------------------------------

const actionsPath = join(root, "app", "(admin)", "admin", "_lib", "actions.ts");
const actions = readFileSync(actionsPath, "utf8");
const payloadBlocks = [
  ...actions.matchAll(/Object\.assign\(payload,\s*\{([\s\S]*?)\n\s*\}\);/g),
].map((m) => m[1]);

const written = new Set();
for (const block of payloadBlocks) {
  for (const m of block.matchAll(/^\s*([a-z_][a-z0-9_]*)\s*:/gm)) written.add(m[1]);
}

const settings = expected.get("site_settings") ?? new Set();
const unknown = [...written].filter((c) => !settings.has(c)).sort();

if (unknown.length) {
  console.error(
    `\n✗ saveSettings writes ${unknown.length} column(s) that no migration creates:\n` +
      unknown.map((c) => `  ${c}`).join("\n") +
      "\n\nAdd a migration for them (and fold it into full_setup.sql), or drop them\n" +
      "from the payload — PostgREST fails the whole save otherwise.\n",
  );
  process.exit(1);
}

console.log(`✓ all ${written.size} columns written by saveSettings exist in site_settings.`);
