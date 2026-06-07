"use client";

import { useState } from "react";
import { MapPin, CalendarDays, DollarSign, ClipboardList, FileText } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate, formatTime, isOnOrBeforeToday } from "@/lib/format";
import type { WorkerJobView } from "@/lib/data/worker";
import { ChecklistModal } from "./ChecklistModal";
import { CompletionModal } from "./CompletionModal";

export function MyJobCard({ job }: { job: WorkerJobView }) {
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const canComplete = isOnOrBeforeToday(job.scheduledDate);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="info">{SERVICE_TYPE_LABELS[job.serviceType]}</Badge>
        {job.jobNumber ? (
          <span className="text-xs font-medium text-axora-navy/50">
            {job.jobNumber}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-sm text-axora-navy">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-axora-navy/50" />
          {job.fullAddress ?? job.city ?? "Address pending"}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-axora-navy/50" />
          {formatDate(job.scheduledDate)}
          {job.scheduledTime ? ` · ${formatTime(job.scheduledTime)}` : ""}
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-4 w-4 text-axora-blue" />
          {formatCurrency(job.payout)} payout
        </div>
      </dl>

      {job.specialInstructions ? (
        <p className="mt-3 rounded-md bg-axora-slate/20 p-3 text-sm text-axora-navy/80">
          <span className="font-semibold">Instructions: </span>
          {job.specialInstructions}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setChecklistOpen(true)}
        >
          <ClipboardList className="h-4 w-4" /> View Checklist
        </Button>
        <Button
          size="sm"
          disabled={!canComplete}
          onClick={() => setCompletionOpen(true)}
          title={canComplete ? undefined : "Available on the day of the job"}
        >
          <FileText className="h-4 w-4" /> Submit Completion
        </Button>
      </div>

      <ChecklistModal
        open={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        serviceType={job.serviceType}
      />
      <CompletionModal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        job={job}
      />
    </Card>
  );
}
