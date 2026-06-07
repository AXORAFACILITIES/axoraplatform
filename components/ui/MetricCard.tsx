import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Card } from "./Card";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/60">
          {label}
        </p>
        {Icon ? <Icon className="h-5 w-5 text-axora-blue" /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-axora-navy">{value}</p>
    </Card>
  );
}
