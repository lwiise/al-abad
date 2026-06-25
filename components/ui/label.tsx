import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-sm font-medium text-foreground", className)} {...props}>
      {children}
      {required && <span className="text-accent"> *</span>}
    </label>
  );
}
