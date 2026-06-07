import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils/cn";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

/**
 * Wraps a single form control with a label, optional hint, and error message.
 * Designed to drop in around an Input, select, or any custom control.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className={labelClassName}>
          {label}
          {required ? <span className="ml-0.5 text-red-600">*</span> : null}
        </Label>
      ) : null}
      {children}
      {hint && !error ? (
        <p className="text-xs text-axora-navy/60">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
