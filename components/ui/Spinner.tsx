import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2 className={cn("h-5 w-5 animate-spin text-axora-blue", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
