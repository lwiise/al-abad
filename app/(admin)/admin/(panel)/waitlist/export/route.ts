import { requireAdmin } from "@/lib/auth";
import { adminDb } from "../../../_lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  await requireAdmin();

  const { data } = await adminDb()
    .from("ai_waitlist")
    .select("email, created_at")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Record<string, unknown>[];

  const header = "email,created_at";
  const body = rows.map((r) => `${csvCell(r.email)},${csvCell(r.created_at)}`).join("\n");
  // UTF-8 BOM so spreadsheet apps open it cleanly.
  const csv = "﻿" + header + "\n" + body;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ai-waitlist.csv"',
    },
  });
}
