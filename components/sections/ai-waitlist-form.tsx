"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
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
 * SECTION 7 IS DARK, so every part here takes the shared `light` route rather
 * than a hand-rolled one: `fieldClasses(true)` for the well, `buttonClasses(…,
 * light)` for the button — which resolves to lilac on ink, so the CTA is the
 * one solid bright object in the section and the field beside it stays a well.
 * This form did hand-roll a white/10 pill once, back when the section was a
 * violet band; it lost it when the section went light, and that is precisely
 * how the four dark treatments the `light` convention replaced came about. If
 * this needs a dark style the shared component does not have, add it there.
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
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-medium text-lilac"
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
          className={cn(fieldClasses(true), "rounded-full px-5 py-3 text-start sm:flex-1")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonClasses("primary", "md", true), "shrink-0 rounded-full px-7 py-3")}
        >
          {pending ? "جارٍ…" : ctaLabel || DEFAULT_CTA}
        </button>
      </div>

      {/* No privacy link: app/(marketing) has no such route, and a 404 under a
          reassurance line is worse than no link at all. The promise is the copy. */}
      <p className="mt-3 text-sm text-neutral-300">{note || DEFAULT_NOTE}</p>

      {/* Lilac text with a coral glyph, which is the same fill-vs-text split
          `accent-strong` makes on light grounds: coral is 3.88:1 on night — a
          graphic, not a label — and `accent-strong` is dark-on-dark here.

          A GLYPH rather than the obvious coral dot, because the dot carried the
          "this went wrong" signal in hue alone: lilac error text against a
          neutral-300 note two lines up is a small difference in lightness, and
          for a red-blind reader the dot beside it is the only thing separating
          them — in a colour they cannot see. A shape says it without colour,
          and it matches the success pill above, which has always had one. */}
      {state.status === "error" && (
        <p
          role="status"
          aria-live="polite"
          // `lg:justify-start` follows the section: the copy column is centred
          // while the layout is stacked and start-aligned once it is two columns,
          // and a flex row does not inherit the `text-align` that moves the rest.
          className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-lilac lg:justify-start"
        >
          <AlertCircle className="size-4 shrink-0 text-accent" aria-hidden="true" />
          {state.message}
        </p>
      )}
    </form>
  );
}
