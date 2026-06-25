"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { submitContact, type FormState } from "@/app/(marketing)/_lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: FormState = { status: "idle" };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-6 text-secondary"
      >
        <Check className="size-6 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="space-y-1.5">
        <Label htmlFor="name" required>
          الاسم
        </Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message" required>
          رسالتك
        </Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>

      {state.status === "error" && (
        <p role="status" aria-live="polite" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الإرسال…" : "إرسال"}
      </Button>
    </form>
  );
}
