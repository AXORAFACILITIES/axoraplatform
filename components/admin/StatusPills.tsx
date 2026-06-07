import { cn } from "@/lib/utils/cn";
import { JOB_STATUS_LABELS } from "@/lib/labels";
import type { JobStatus } from "@/lib/types/database.types";

const ORDER: JobStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
];

export function StatusPills({ counts }: { counts: Record<JobStatus, number> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map((s) => (
        <span
          key={s}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-axora-slate px-3 py-1 text-xs font-medium text-axora-navy",
          )}
        >
          {JOB_STATUS_LABELS[s]}
          <span className="font-bold text-axora-blue">{counts[s]}</span>
        </span>
      ))}
    </div>
  );
}
