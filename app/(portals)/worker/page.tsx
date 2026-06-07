import { Briefcase, DollarSign, ClipboardCheck, Wallet } from "lucide-react";

import { getWorkerContext, getWorkerDashboard } from "@/lib/data/worker";
import { MetricCard } from "@/components/ui/MetricCard";
import { OfferedJobCard } from "@/components/worker/OfferedJobCard";
import { MyJobCard } from "@/components/worker/MyJobCard";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

function SectionEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-axora-slate bg-white p-6 text-center text-sm text-axora-navy/60">
      {children}
    </p>
  );
}

export default async function WorkerDashboardPage() {
  const ctx = await getWorkerContext();
  const firstName = ctx?.profile?.first_name?.trim() || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const data = ctx
    ? await getWorkerDashboard(ctx)
    : {
        jobsThisMonth: 0,
        earningsThisMonth: 0,
        jobsAllTime: 0,
        totalEarnings: 0,
        offered: [],
        upcoming: [],
      };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-axora-navy">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-axora-navy/60">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Jobs this month" value={data.jobsThisMonth} icon={Briefcase} />
        <MetricCard
          label="Earnings this month"
          value={formatCurrency(data.earningsThisMonth)}
          icon={DollarSign}
        />
        <MetricCard label="Jobs all time" value={data.jobsAllTime} icon={ClipboardCheck} />
        <MetricCard
          label="Total earnings"
          value={formatCurrency(data.totalEarnings)}
          icon={Wallet}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-axora-navy">
          Offered to You
        </h2>
        {data.offered.length === 0 ? (
          <SectionEmpty>No job offers right now.</SectionEmpty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.offered.map((j) => (
              <OfferedJobCard key={j.assignmentId} job={j} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-axora-navy">
          Upcoming Jobs
        </h2>
        {data.upcoming.length === 0 ? (
          <SectionEmpty>You have no upcoming jobs scheduled.</SectionEmpty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.upcoming.map((j) => (
              <MyJobCard key={j.assignmentId} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
