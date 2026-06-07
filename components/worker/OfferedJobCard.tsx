"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, Clock, DollarSign } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  acceptAssignment,
  declineAssignment,
  type ActionResult,
} from "@/app/(portals)/worker/actions";
import { SERVICE_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { WorkerJobView } from "@/lib/data/worker";

export function OfferedJobCard({ job }: { job: WorkerJobView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: (id: string) => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn(job.assignmentId);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else router.refresh();
    });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{SERVICE_TYPE_LABELS[job.serviceType]}</Badge>
        {job.propertyType ? (
          <Badge>{PROPERTY_TYPE_LABELS[job.propertyType]}</Badge>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-sm text-axora-navy">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-axora-navy/50" />
          {job.city ?? "Area shared after acceptance"}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-axora-navy/50" />
          {formatDate(job.scheduledDate)}
          {job.scheduledTime ? ` · ${formatTime(job.scheduledTime)}` : ""}
        </div>
        {job.estimatedDurationHours ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-axora-navy/50" />
            ~{job.estimatedDurationHours} hrs
          </div>
        ) : null}
        <div className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-4 w-4 text-axora-blue" />
          {formatCurrency(job.payout)} estimated payout
        </div>
      </dl>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(acceptAssignment)}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(declineAssignment)}
        >
          Decline
        </Button>
      </div>
    </Card>
  );
}
