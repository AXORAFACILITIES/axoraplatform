import { getWorkerContext, getWorkerJobs } from "@/lib/data/worker";
import { JobsTabs } from "@/components/worker/JobsTabs";

export const dynamic = "force-dynamic";

export default async function WorkerJobsPage() {
  const ctx = await getWorkerContext();
  const { available, myJobs } = ctx
    ? await getWorkerJobs(ctx)
    : { available: [], myJobs: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Jobs</h1>
      <JobsTabs available={available} myJobs={myJobs} />
    </div>
  );
}
