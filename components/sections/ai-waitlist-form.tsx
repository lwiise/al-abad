"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { joinWaitlist, type FormState } from "@/app/(marketing)/_lib/actions";

const initial: FormState = { status: "idle" };

export function AiWaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-on-highlight"
      >
        <Check className="size-5" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="w-full max-w-md">
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          dir="ltr"
          aria-label="بريدك الإلكتروني"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="بريدك الإلكتروني"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-start text-white placeholder:text-white/60 focus:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-white px-6 py-3 font-medium text-highlight transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? "جارٍ…" : "انضم لقائمة الانتظار"}
        </button>
      </div>
      {state.status === "error" && (
        <p role="status" aria-live="polite" className="mt-2 text-sm text-white/90">
          {state.message}
        </p>
      )}
    </form>
  );
}
