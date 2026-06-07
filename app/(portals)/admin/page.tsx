import Link from "next/link";
import { Briefcase, DollarSign, TrendingUp, UserPlus, FileWarning } from "lucide-react";

import { getAdminOverview } from "@/lib/data/admin";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusPills } from "@/components/admin/StatusPills";
import { MarkCompleteButton } from "@/components/admin/MarkCompleteButton";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-axora-navy">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Jobs this month" value={data.jobsThisMonth} icon={Briefcase} />
        <MetricCard
          label="Revenue this month"
          value={formatCurrency(data.revenueThisMonth)}
          icon={DollarSign}
        />
        <MetricCard
          label="Axora margin this month"
          value={formatCurrency(data.marginThisMonth)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Pending applications"
          value={data.pendingApplications}
          icon={UserPlus}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPills counts={data.jobsByStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices requiring attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileWarning className="h-8 w-8 text-amber-500" />
              <span className="text-3xl font-bold text-axora-navy">
                {data.invoicesAttention}
              </span>
              <span className="text-sm text-axora-navy/60">
                not sent or overdue
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's jobs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-axora-navy">
          Today&apos;s Jobs
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Job #</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Contractor(s)</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axora-slate/60">
                {data.todaysJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-axora-navy/60">
                      No jobs scheduled today.
                    </td>
                  </tr>
                ) : (
                  data.todaysJobs.map((j) => (
                    <tr key={j.id} className="text-axora-navy">
                      <td className="px-4 py-3 font-medium">{j.jobNumber ?? "—"}</td>
                      <td className="px-4 py-3">{j.clientName}</td>
                      <td className="px-4 py-3">{j.address ?? "—"}</td>
                      <td className="px-4 py-3">{SERVICE_TYPE_LABELS[j.serviceType]}</td>
                      <td className="px-4 py-3">
                        {j.contractorNames.length
                          ? j.contractorNames.join(", ")
                          : "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={JOB_STATUS_VARIANT[j.status]}>
                          {JOB_STATUS_LABELS[j.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href="/admin/jobs"
                            className="text-sm font-medium text-axora-blue hover:underline"
                          >
                            View
                          </Link>
                          {j.status !== "completed" &&
                          j.status !== "cancelled" ? (
                            <MarkCompleteButton jobId={j.id} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* New applications + quotes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-axora-navy">New Applications</h2>
            <Link href="/admin/contractors" className="text-sm font-medium text-axora-blue hover:underline">
              View all
            </Link>
          </div>
          <Card className="divide-y divide-axora-slate/60">
            {data.recentApplications.length === 0 ? (
              <p className="p-4 text-center text-sm text-axora-navy/60">
                No pending applications.
              </p>
            ) : (
              data.recentApplications.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-axora-navy">
                      {a.first_name} {a.last_name}
                    </p>
                    <p className="truncate text-xs text-axora-navy/60">
                      {a.email} · {a.phone}
                    </p>
                    <p className="truncate text-xs text-axora-navy/50">
                      {(a.services_offered ?? []).join(", ") || "—"} ·{" "}
                      {formatDate(a.submitted_at)}
                    </p>
                  </div>
                  <Link
                    href="/admin/contractors"
                    className="shrink-0 rounded-md bg-axora-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-axora-navy"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-axora-navy">New Quote Requests</h2>
            <Link href="/admin/quote-requests" className="text-sm font-medium text-axora-blue hover:underline">
              View all
            </Link>
          </div>
          <Card className="divide-y divide-axora-slate/60">
            {data.recentQuotes.length === 0 ? (
              <p className="p-4 text-center text-sm text-axora-navy/60">
                No new quote requests.
              </p>
            ) : (
              data.recentQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-axora-navy">
                      {q.name}
                    </p>
                    <p className="truncate text-xs text-axora-navy/60">
                      {q.service_type ?? "—"} · {formatDate(q.created_at)}
                    </p>
                  </div>
                  <a
                    href={`mailto:${q.email}`}
                    className="shrink-0 rounded-md bg-axora-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-axora-navy"
                  >
                    Contact Now
                  </a>
                </div>
              ))
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
