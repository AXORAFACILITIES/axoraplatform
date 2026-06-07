import { CalendarDays, ClipboardCheck, Wallet, MapPin, User } from "lucide-react";

import { getClientContext, getClientDashboard } from "@/lib/data/client";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RescheduleNotice } from "@/components/client/RescheduleNotice";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import {
  SERVICE_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANT,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_VARIANT,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

function SectionEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-axora-slate bg-white p-6 text-center text-sm text-axora-navy/60">
      {children}
    </p>
  );
}

export default async function ClientDashboardPage() {
  const ctx = await getClientContext();
  const firstName = ctx?.profile?.first_name?.trim() || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const data = ctx
    ? await getClientDashboard(ctx)
    : {
        nextAppointment: null,
        totalJobs: 0,
        totalSpent: 0,
        upcoming: [],
        recent: [],
      };

  const next = data.nextAppointment;
  const nextLabel = next
    ? `${formatDate(next.scheduledDate)} · ${SERVICE_TYPE_LABELS[next.serviceType]}`
    : "None scheduled";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-axora-navy">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-axora-navy/60">{today}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Next appointment" value={nextLabel} icon={CalendarDays} />
        <MetricCard label="Jobs completed" value={data.totalJobs} icon={ClipboardCheck} />
        <MetricCard
          label="Total spent"
          value={formatCurrency(data.totalSpent)}
          icon={Wallet}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-axora-navy">
          Upcoming Services
        </h2>
        {data.upcoming.length === 0 ? (
          <SectionEmpty>No upcoming services scheduled.</SectionEmpty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.upcoming.map((j) => (
              <Card key={j.jobId} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="info">{SERVICE_TYPE_LABELS[j.serviceType]}</Badge>
                  <Badge variant={JOB_STATUS_VARIANT[j.status]}>
                    {JOB_STATUS_LABELS[j.status]}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-2 text-sm text-axora-navy">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-axora-navy/50" />
                    {formatDate(j.scheduledDate)}
                    {j.scheduledTime ? ` · ${formatTime(j.scheduledTime)}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-axora-navy/50" />
                    {j.locationLabel}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-axora-navy/50" />
                    {j.contractorFirstName ?? "To be assigned"}
                  </div>
                </dl>
                <div className="mt-4">
                  <RescheduleNotice />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-axora-navy">
          Recent Activity
        </h2>
        {data.recent.length === 0 ? (
          <SectionEmpty>No completed services yet.</SectionEmpty>
        ) : (
          <Card className="divide-y divide-axora-slate/60">
            {data.recent.map((j) => (
              <div
                key={j.jobId}
                className="flex flex-wrap items-center justify-between gap-2 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-axora-navy">
                    {SERVICE_TYPE_LABELS[j.serviceType]}
                  </p>
                  <p className="text-xs text-axora-navy/60">
                    {formatDate(j.scheduledDate)} · {j.locationLabel}
                  </p>
                </div>
                <Badge variant={INVOICE_STATUS_VARIANT[j.invoiceStatus]}>
                  {INVOICE_STATUS_LABELS[j.invoiceStatus]}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
