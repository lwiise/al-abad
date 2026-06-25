import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/40";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={rows} className={cn(fieldClasses, "resize-y leading-relaxed", className)} {...props} />
  );
}

export { fieldClasses };
