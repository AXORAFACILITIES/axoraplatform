import { AlertTriangle } from "lucide-react";

import { getClientContext, getClientInvoices } from "@/lib/data/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANT,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
  const ctx = await getClientContext();
  const { rows, overdueCount } = ctx
    ? await getClientInvoices(ctx)
    : { rows: [], overdueCount: 0 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Invoices</h1>

      {overdueCount > 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          You have {overdueCount} overdue invoice
          {overdueCount === 1 ? "" : "s"}. Please contact Axora Facilities to
          resolve.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Invoice / Job #</th>
                <th className="px-4 py-3 font-semibold">Date of Service</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-axora-navy/60">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.jobId} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">{r.jobNumber ?? "—"}</td>
                    <td className="px-4 py-3">{formatDate(r.scheduledDate)}</td>
                    <td className="px-4 py-3">
                      {SERVICE_TYPE_LABELS[r.serviceType]}
                    </td>
                    <td className="px-4 py-3">{r.fullAddress ?? r.locationLabel}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(r.totalClientPrice ?? r.clientPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={INVOICE_STATUS_VARIANT[r.invoiceStatus]}>
                        {INVOICE_STATUS_LABELS[r.invoiceStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(r.invoicePaidAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-axora-navy/50">
        Payments are processed via Axora&apos;s secure invoicing system. For
        questions about an invoice, contact{" "}
        <a
          href="mailto:info@axorafacilities.com"
          className="font-medium text-axora-blue underline"
        >
          info@axorafacilities.com
        </a>
        .
      </p>
    </div>
  );
}
