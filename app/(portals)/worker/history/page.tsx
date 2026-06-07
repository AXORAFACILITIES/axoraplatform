import Link from "next/link";

import { getWorkerContext, getWorkerHistory } from "@/lib/data/worker";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HistoryControls } from "@/components/worker/HistoryControls";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  PAYOUT_STATUS_LABELS,
  PAYOUT_STATUS_VARIANT,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function WorkerHistoryPage({
  searchParams,
}: {
  searchParams: { month?: string; page?: string };
}) {
  const month =
    typeof searchParams.month === "string" ? searchParams.month : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const ctx = await getWorkerContext();
  const { rows, totalForPeriod } = ctx
    ? await getWorkerHistory(ctx, month)
    : { rows: [], totalForPeriod: 0 };

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const qp = (p: number) =>
    `/worker/history?${month ? `month=${month}&` : ""}page=${p}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-axora-navy">Pay History</h1>
        <HistoryControls />
      </div>

      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/60">
          {month ? "Earnings for selected period" : "Total earnings"}
        </p>
        <p className="mt-1 text-2xl font-bold text-axora-navy">
          {formatCurrency(totalForPeriod)}
        </p>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Job #</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Your Payout</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-axora-navy/60"
                  >
                    No completed jobs for this period.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.assignmentId} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">
                      {r.jobNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3">{formatDate(r.scheduledDate)}</td>
                    <td className="px-4 py-3">
                      {SERVICE_TYPE_LABELS[r.serviceType]}
                    </td>
                    <td className="px-4 py-3">{r.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(r.totalClientPrice ?? r.clientPrice)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(r.payout)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PAYOUT_STATUS_VARIANT[r.payoutStatus]}>
                        {PAYOUT_STATUS_LABELS[r.payoutStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(r.completedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-axora-navy/60">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={qp(page - 1)}
                className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy hover:bg-axora-slate/40"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={qp(page + 1)}
                className="rounded-md border border-axora-slate px-3 py-1.5 font-medium text-axora-navy hover:bg-axora-slate/40"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
