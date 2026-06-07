"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANT,
} from "@/lib/labels";
import { CreateJobPanel } from "./CreateJobPanel";
import { JobDetailPanel } from "./JobDetailPanel";
import type {
  AdminJobView,
  SelectOption,
  ContractorOption,
} from "@/lib/data/admin";
import type { JobStatus, ServiceType } from "@/lib/types/database.types";

const PAGE_SIZE = 25;
const SELECT =
  "h-10 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

export function JobsManager({
  jobs,
  clients,
  contractors,
  locationsByClient,
  payoutPercent,
}: {
  jobs: AdminJobView[];
  clients: SelectOption[];
  contractors: ContractorOption[];
  locationsByClient: Record<string, SelectOption[]>;
  payoutPercent: number;
}) {
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<AdminJobView | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!status || j.status === status) &&
        (!service || j.serviceType === service) &&
        (!term ||
          (j.jobNumber ?? "").toLowerCase().includes(term) ||
          j.clientName.toLowerCase().includes(term) ||
          (j.city ?? "").toLowerCase().includes(term)),
    );
  }, [jobs, status, service, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className={SELECT} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {(Object.keys(JOB_STATUS_LABELS) as JobStatus[]).map((s) => (
              <option key={s} value={s}>{JOB_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select className={SELECT} value={service} onChange={(e) => { setService(e.target.value); setPage(1); }}>
            <option value="">All services</option>
            {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => (
              <option key={s} value={s}>{SERVICE_TYPE_LABELS[s]}</option>
            ))}
          </select>
          <input
            placeholder="Search job #, client, city…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-64 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create New Job
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Job #</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Scheduled</th>
                <th className="px-4 py-3 font-semibold">Assigned</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-axora-navy/60">
                    No jobs match your filters.
                  </td>
                </tr>
              ) : (
                paged.map((j) => (
                  <tr key={j.id} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">{j.jobNumber ?? "—"}</td>
                    <td className="px-4 py-3">{j.clientName}</td>
                    <td className="px-4 py-3">{j.city ?? "—"}</td>
                    <td className="px-4 py-3">{SERVICE_TYPE_LABELS[j.serviceType]}</td>
                    <td className="px-4 py-3">{formatDate(j.scheduledDate)}</td>
                    <td className="px-4 py-3">
                      {j.contractorNames.length ? j.contractorNames.join(", ") : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={JOB_STATUS_VARIANT[j.status]}>
                        {JOB_STATUS_LABELS[j.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(j.totalClientPrice ?? j.clientPrice)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={INVOICE_STATUS_VARIANT[j.invoiceStatus]}>
                        {INVOICE_STATUS_LABELS[j.invoiceStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(j)}
                        className="text-sm font-medium text-axora-blue hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-axora-navy/60">Page {safePage} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy enabled:hover:bg-axora-slate/40 disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy enabled:hover:bg-axora-slate/40 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      ) : null}

      <CreateJobPanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={clients}
        contractors={contractors}
        locationsByClient={locationsByClient}
        payoutPercent={payoutPercent}
      />
      {selected ? (
        <JobDetailPanel job={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
