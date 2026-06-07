import { getAdminClients } from "@/lib/data/admin";
import { ClientsView } from "@/components/admin/ClientsView";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getAdminClients();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Clients</h1>
      <ClientsView clients={clients} />
    </div>
  );
}
