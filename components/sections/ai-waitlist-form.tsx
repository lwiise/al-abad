"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "@/components/ui/input";
import { buttonClasses } from "@/components/ui/button";
import { joinWaitlist, type FormState } from "@/app/(marketing)/_lib/actions";

const initial: FormState = { status: "idle" };
const DEFAULT_CTA = "انضم لقائمة الانتظار";
const DEFAULT_NOTE = "لن نشارك بريدك مع أحد، ويمكنك إلغاء الاشتراك في أي وقت.";

/**
 * The waiting-list capture.
 *
 * Only the CTA label and the note under it come from the CMS. The field's
 * accessible name, the pending label and the four result messages inside
 * `joinWaitlist` are interface states, not marketing copy — an editor blanking
 * the aria-label would silently break the form for screen readers, with nothing
 * gained.
 *
 * It used to hand-roll a white/10 pill because it sat on the violet band. On
 * the light panel that reason is gone, so it takes the shared field and button.
 */
export function AiWaitlistForm({
  ctaLabel,
  note,
}: {
  ctaLabel?: string | null;
  note?: string | null;
}) {
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-5 py-3 font-medium text-secondary"
      >
        <Check className="size-5 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="w-full max-w-xl">
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
          className={cn(fieldClasses, "rounded-full px-5 py-3 text-start sm:flex-1")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonClasses("primary", "md"), "shrink-0 rounded-full px-7 py-3")}
        >
          {pending ? "جارٍ…" : ctaLabel || DEFAULT_CTA}
        </button>
      </div>

      {/* No privacy link: app/(marketing) has no such route, and a 404 under a
          reassurance line is worse than no link at all. The promise is the copy. */}
      <p className="mt-3 text-sm text-foreground-muted">{note || DEFAULT_NOTE}</p>

      {state.status === "error" && (
        <p role="status" aria-live="polite" className="mt-2 text-sm font-medium text-accent-strong">
          {state.message}
        </p>
      )}
    </form>
  );
}
