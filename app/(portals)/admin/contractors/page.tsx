import { getApplications, getRoster } from "@/lib/data/admin";
import { ContractorsView } from "@/components/admin/ContractorsView";

export const dynamic = "force-dynamic";

export default async function AdminContractorsPage() {
  const [applications, roster] = await Promise.all([
    getApplications(),
    getRoster(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Contractors</h1>
      <ContractorsView applications={applications} roster={roster} />
    </div>
  );
}
