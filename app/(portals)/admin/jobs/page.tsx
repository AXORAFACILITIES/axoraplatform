import {
  getAdminJobs,
  getClientOptions,
  getContractorOptions,
  getLocationsByClient,
  getAdminSettings,
} from "@/lib/data/admin";
import { JobsManager } from "@/components/admin/JobsManager";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const [jobs, clients, contractors, locationsByClient, settings] =
    await Promise.all([
      getAdminJobs(),
      getClientOptions(),
      getContractorOptions(),
      getLocationsByClient(),
      getAdminSettings(),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Jobs</h1>
      <JobsManager
        jobs={jobs}
        clients={clients}
        contractors={contractors}
        locationsByClient={locationsByClient}
        payoutPercent={settings.contractorPayoutPercent}
      />
    </div>
  );
}
