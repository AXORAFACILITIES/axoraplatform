"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANT,
} from "@/lib/labels";
import { toggleContractorActive } from "@/app/(portals)/admin/actions";
import { ReviewDrawer } from "./ReviewDrawer";
import type { ApplicationRow, RosterRow } from "@/lib/data/admin";
import type { ApplicationStatus } from "@/lib/types/database.types";

const SELECT =
  "h-10 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

function ApplicationsTab({ applications }: { applications: ApplicationRow[] }) {
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [selected, setSelected] = useState<ApplicationRow | null>(null);
  const rows = applications.filter((a) => status === "all" || a.status === status);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          className={SELECT}
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus | "all")}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Services</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-axora-navy/60">
                    No applications.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id} className="text-axora-navy">
                    <td className="px-4 py-3">{formatDate(a.submitted_at)}</td>
                    <td className="px-4 py-3 font-medium">
                      {a.first_name} {a.last_name}
                    </td>
                    <td className="px-4 py-3">{a.phone}</td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="max-w-[16rem] truncate px-4 py-3">
                      {(a.services_offered ?? []).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={APPLICATION_STATUS_VARIANT[a.status]}>
                        {APPLICATION_STATUS_LABELS[a.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setSelected(a)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <ReviewDrawer application={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function RosterTab({ roster }: { roster: RosterRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const term = search.trim().toLowerCase();
  const rows = roster.filter(
    (r) =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.email ?? "").toLowerCase().includes(term) ||
      r.services.join(" ").toLowerCase().includes(term) ||
      r.areas.join(" ").toLowerCase().includes(term),
  );

  const toggle = (id: string, next: boolean) =>
    startTransition(async () => {
      await toggleContractorActive(id, next);
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input
          placeholder="Search name, email, service, area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-72 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky"
        />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Services</th>
                <th className="px-4 py-3 font-semibold">Jobs</th>
                <th className="px-4 py-3 font-semibold">Earnings</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-axora-navy/60">
                    No contractors on the roster.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3">{r.email ?? "—"}</td>
                    <td className="max-w-[14rem] truncate px-4 py-3">
                      {r.services.join(", ")}
                    </td>
                    <td className="px-4 py-3">{r.jobsCompleted}</td>
                    <td className="px-4 py-3">{formatCurrency(r.totalEarnings)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggle(r.id, !r.isActive)}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          r.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-axora-slate/60 text-axora-navy",
                        )}
                      >
                        {r.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function ContractorsView({
  applications,
  roster,
}: {
  applications: ApplicationRow[];
  roster: RosterRow[];
}) {
  const [tab, setTab] = useState<"applications" | "roster">("applications");
  const tabBtn = (key: "applications" | "roster", label: string, count: number) => (
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
    <div>
      <div className="mb-6 flex border-b border-axora-slate">
        {tabBtn("applications", "Applications", applications.length)}
        {tabBtn("roster", "Active Roster", roster.length)}
      </div>
      {tab === "applications" ? (
        <ApplicationsTab applications={applications} />
      ) : (
        <RosterTab roster={roster} />
      )}
    </div>
  );
}
