import { getClientContext, getClientBookings } from "@/lib/data/client";
import { BookingsView } from "@/components/client/BookingsView";

export const dynamic = "force-dynamic";

export default async function ClientBookingsPage() {
  const ctx = await getClientContext();
  const { upcoming, past, locations } = ctx
    ? await getClientBookings(ctx)
    : { upcoming: [], past: [], locations: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">My Bookings</h1>
      <BookingsView upcoming={upcoming} past={past} locations={locations} />
    </div>
  );
}
