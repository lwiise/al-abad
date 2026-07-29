import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/40";

/** On light grounds — background, surface, lilac. */
const onLight =
  "border-border bg-background text-foreground placeholder:text-foreground-subtle focus:border-primary";

/**
 * On dark grounds, selected with `light` — the same convention `Button` and
 * `SectionHeading` use, where `light` means "this sits on a dark ground".
 *
 * Not a cosmetic mirror of the set above. A white field on a night band reads
 * as a hole punched in the section, and `foreground-subtle` as a placeholder is
 * dark-on-dark. This is a translucent well instead: white/10 over neutral-900
 * carries white at 10.90:1 and a neutral-300 placeholder at 7.04:1, so the
 * typed value is clearly louder than the prompt. Plum cannot be the focus
 * colour here (1.26:1 on ink) — lilac is, matching the dark button set.
 *
 * This exists because `ai-waitlist-form` had hand-rolled exactly this pill once
 * before, lost it when its section went light, and needed it again. The next
 * dark form should take it from here rather than growing a third copy.
 */
const onDark =
  "border-white/25 bg-white/10 text-white placeholder:text-neutral-300 focus:border-lilac";

/** Shared classes so any input can be styled to match. */
export function fieldClasses(light = false) {
  return cn(base, light ? onDark : onLight);
}

export function Input({
  className,
  light = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  /** Set on dark (ink / night) grounds — see the note on `onDark`. */
  light?: boolean;
}) {
  return <input className={cn(fieldClasses(light), className)} {...props} />;
}

export function Textarea({
  className,
  rows = 4,
  light = false,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  light?: boolean;
}) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldClasses(light), "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}
