"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANT,
} from "@/lib/labels";
import type { ClientJobView, LocationOption } from "@/lib/data/client";
import type { ServiceType } from "@/lib/types/database.types";

const PAGE_SIZE = 10;
const SELECT =
  "h-10 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

export function BookingsView({
  upcoming,
  past,
  locations,
}: {
  upcoming: ClientJobView[];
  past: ClientJobView[];
  locations: LocationOption[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [locationId, setLocationId] = useState("");
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);

  const matches = (r: ClientJobView) =>
    (!locationId || r.locationId === locationId) &&
    (!service || r.serviceType === service);

  const upcomingRows = useMemo(
    () => upcoming.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [upcoming, locationId, service],
  );
  const pastRows = useMemo(
    () => past.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [past, locationId, service],
  );

  const totalPages = Math.max(1, Math.ceil(pastRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedPast = pastRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const tabBtn = (key: "upcoming" | "past", label: string, count: number) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        "border-b-2 px-4 py-2 text-sm font-medium",
        tab === key
          ? "border-axora-blue text-axora-navy"
          : "border-transparent text-axora-navy/50 hover:text-axora-navy",
      )}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex border-b border-axora-slate">
          {tabBtn("upcoming", "Upcoming", upcomingRows.length)}
          {tabBtn("past", "Past", pastRows.length)}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={SELECT}
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All properties</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            className={SELECT}
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All services</option>
            {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => (
              <option key={s} value={s}>
                {SERVICE_TYPE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "upcoming" ? (
            <table className="w-full text-sm">
              <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Contractor</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axora-slate/60">
                {upcomingRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-axora-navy/60">
                      No upcoming bookings.
                    </td>
                  </tr>
                ) : (
                  upcomingRows.map((r) => (
                    <tr key={r.jobId} className="text-axora-navy">
                      <td className="px-4 py-3">
                        {SERVICE_TYPE_LABELS[r.serviceType]}
                      </td>
                      <td className="px-4 py-3">{formatDate(r.scheduledDate)}</td>
                      <td className="px-4 py-3">
                        {r.scheduledTime ? formatTime(r.scheduledTime) : "—"}
                      </td>
                      <td className="px-4 py-3">{r.locationLabel}</td>
                      <td className="px-4 py-3">
                        {r.contractorFirstName ?? "To be assigned"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={JOB_STATUS_VARIANT[r.status]}>
                          {JOB_STATUS_LABELS[r.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Job #</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axora-slate/60">
                {pagedPast.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-axora-navy/60">
                      No past bookings.
                    </td>
                  </tr>
                ) : (
                  pagedPast.map((r) => (
                    <tr key={r.jobId} className="text-axora-navy">
                      <td className="px-4 py-3 font-medium">
                        {r.jobNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">{formatDate(r.scheduledDate)}</td>
                      <td className="px-4 py-3">
                        {SERVICE_TYPE_LABELS[r.serviceType]}
                      </td>
                      <td className="px-4 py-3">
                        {r.fullAddress ?? r.locationLabel}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(r.totalClientPrice ?? r.clientPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={INVOICE_STATUS_VARIANT[r.invoiceStatus]}>
                          {INVOICE_STATUS_LABELS[r.invoiceStatus]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.invoiceStatus === "paid" ? (
                          <Link
                            href="/client/invoices"
                            className="text-sm font-medium text-axora-blue hover:underline"
                          >
                            View
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {tab === "past" && totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-axora-navy/60">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy enabled:hover:bg-axora-slate/40 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy enabled:hover:bg-axora-slate/40 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
