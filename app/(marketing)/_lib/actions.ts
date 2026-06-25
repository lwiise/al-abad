"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";

// Untyped anon client for lead inserts (RLS allows anon INSERT). The hand-written
// Database insert types are too strict for dynamic payloads here.
function leadDb(): SupabaseClient {
  return createPublicClient() as unknown as SupabaseClient;
}

export type FormState = { status: "idle" | "success" | "error"; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared bot trap: a hidden "company" field real users never fill.
function isBot(formData: FormData) {
  return String(formData.get("company") ?? "").trim() !== "";
}

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { status: "success", message: "تم تسجيلك بنجاح." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "يرجى إدخال بريد إلكتروني صحيح." };
  }

  const supabase = leadDb();
  const { error } = await supabase.from("ai_waitlist").insert({ email });

  if (error) {
    // 23505 = unique violation → already subscribed (treat as success).
    if (error.code === "23505") {
      return { status: "success", message: "أنت مسجَّل بالفعل في قائمة الانتظار." };
    }
    return { status: "error", message: "تعذّر التسجيل، حاول مرة أخرى." };
  }

  return { status: "success", message: "تم تسجيلك! سنخبرك فور إطلاق المساعد الذكي." };
}

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isBot(fd)) return { status: "success", message: "تم استلام رسالتك." };

  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();

  if (!name || !message) {
    return { status: "error", message: "يرجى تعبئة الاسم والرسالة." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { status: "error", message: "البريد الإلكتروني غير صحيح." };
  }

  const supabase = leadDb();
  const { error } = await supabase
    .from("contact_submissions")
    .insert({ name, email: email || null, message });

  if (error) return { status: "error", message: "تعذّر الإرسال، حاول مرة أخرى." };

  return { status: "success", message: "تم استلام رسالتك، سنعود إليك قريباً." };
}
