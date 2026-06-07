import { getQuoteRequests } from "@/lib/data/admin";
import { QuoteRequestsView } from "@/components/admin/QuoteRequestsView";

export const dynamic = "force-dynamic";

export default async function AdminQuoteRequestsPage() {
  const quotes = await getQuoteRequests();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-axora-navy">Quote Requests</h1>
      <QuoteRequestsView quotes={quotes} />
    </div>
  );
}
