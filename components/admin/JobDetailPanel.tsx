"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANT,
} from "@/lib/labels";
import { markInvoice, setJobStatus } from "@/app/(portals)/admin/actions";
import type { AdminJobView } from "@/lib/data/admin";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">
        {label}
      </dt>
      <dd className="text-sm text-axora-navy">{value || "—"}</dd>
    </div>
  );
}

export function JobDetailPanel({
  job,
  onClose,
}: {
  job: AdminJobView;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else router.refresh();
    });

  const closed = job.status === "completed" || job.status === "cancelled";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-axora-navy/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-axora-slate px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-axora-navy">
              {job.jobNumber ?? "Job"}
            </h2>
            <Badge variant={JOB_STATUS_VARIANT[job.status]}>
              {JOB_STATUS_LABELS[job.status]}
            </Badge>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-axora-navy/60 hover:bg-axora-slate/40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Client" value={job.clientName} />
            <Field label="Service" value={SERVICE_TYPE_LABELS[job.serviceType]} />
            <Field
              label="Scheduled"
              value={`${formatDate(job.scheduledDate)}${job.scheduledTime ? ` · ${formatTime(job.scheduledTime)}` : ""}`}
            />
            <Field label="Address" value={job.address} />
            <Field
              label="Contractor(s)"
              value={job.contractorNames.length ? job.contractorNames.join(", ") : "Unassigned"}
            />
            {job.isRush ? <Field label="Rush" value="Yes" /> : null}
          </dl>

          <div className="grid grid-cols-2 gap-2 rounded-md bg-axora-slate/20 p-3 text-sm text-axora-navy">
            <span>Client price</span>
            <span className="text-right font-medium">{formatCurrency(job.clientPrice)}</span>
            <span>Contractor payout</span>
            <span className="text-right font-medium">{formatCurrency(job.contractorPayout)}</span>
            <span>Axora margin</span>
            <span className="text-right font-medium">{formatCurrency(job.axoraMargin)}</span>
            <span className="font-semibold">Total client price</span>
            <span className="text-right font-bold">{formatCurrency(job.totalClientPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-axora-navy/60">Invoice:</span>
            <Badge variant={INVOICE_STATUS_VARIANT[job.invoiceStatus]}>
              {INVOICE_STATUS_LABELS[job.invoiceStatus]}
            </Badge>
          </div>

          {job.specialInstructions ? (
            <p className="rounded-md bg-axora-slate/20 p-3 text-sm text-axora-navy/80">
              <span className="font-semibold">Instructions: </span>
              {job.specialInstructions}
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="space-y-2 border-t border-axora-slate p-5">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => markInvoice(job.id, "sent"))}>
              Mark Invoice Sent
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => markInvoice(job.id, "paid"))}>
              Mark Invoice Paid
            </Button>
          </div>
          {!closed ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={pending} onClick={() => run(() => setJobStatus(job.id, "completed"))}>
                Mark Complete
              </Button>
              <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => setJobStatus(job.id, "cancelled"))}>
                Cancel Job
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
