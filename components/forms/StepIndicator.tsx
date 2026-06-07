import { Check } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface StepIndicatorProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}

export function StepIndicator({
  steps,
  current,
  className,
}: StepIndicatorProps) {
  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < current;
        const isActive = index === current;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  isComplete && "bg-axora-blue text-white",
                  isActive && "border-2 border-axora-blue text-axora-blue",
                  !isComplete &&
                    !isActive &&
                    "border border-axora-slate text-axora-navy/50",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isActive ? "text-axora-navy" : "text-axora-navy/60",
                )}
              >
                {step}
              </span>
            </div>
            {!isLast ? (
              <span
                className={cn(
                  "mx-2 h-px flex-1",
                  isComplete ? "bg-axora-blue" : "bg-axora-slate",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
