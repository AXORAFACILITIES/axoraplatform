import { getClientContext, getClientLocations } from "@/lib/data/client";
import { LocationList } from "@/components/client/LocationList";

export const dynamic = "force-dynamic";

export default async function ClientLocationsPage() {
  const ctx = await getClientContext();
  const locations = ctx ? await getClientLocations(ctx) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-axora-navy">My Properties</h1>
        <p className="text-sm text-axora-navy/60">
          Manage the addresses we service for you.
        </p>
      </div>
      <LocationList locations={locations} />
    </div>
  );
}
