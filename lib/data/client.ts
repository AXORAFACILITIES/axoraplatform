import { createClient, createServiceClient } from "@/lib/supabase/server";
import type {
  Database,
  ServiceType,
  JobStatus,
  InvoiceStatus,
  PropertyType,
} from "@/lib/types/database.types";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type LocationRow = Database["public"]["Tables"]["service_locations"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export interface ClientJobView {
  jobId: string;
  jobNumber: string | null;
  serviceType: ServiceType;
  status: JobStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  locationId: string | null;
  locationLabel: string;
  fullAddress: string | null;
  city: string | null;
  contractorFirstName: string | null;
  totalClientPrice: number | null;
  clientPrice: number | null;
  invoiceStatus: InvoiceStatus;
  invoiceSentAt: string | null;
  invoicePaidAt: string | null;
}

export interface ClientContext {
  userId: string;
  profile: ProfileRow | null;
  client: ClientRow | null;
}

function addressOf(loc: LocationRow | undefined): {
  label: string;
  full: string | null;
  city: string | null;
} {
  if (!loc) return { label: "Property", full: null, city: null };
  const full =
    [
      loc.street_address,
      [loc.city, loc.state].filter(Boolean).join(", "),
      loc.zip_code,
    ]
      .filter(Boolean)
      .join(" · ") || null;
  return {
    label: loc.nickname || loc.city || "Property",
    full,
    city: loc.city ?? null,
  };
}

export async function getClientContext(): Promise<ClientContext | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const [profileRes, clientRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("clients").select("*").eq("id", user.id).maybeSingle(),
    ]);
    return {
      userId: user.id,
      profile: profileRes.data ?? null,
      client: clientRes.data ?? null,
    };
  } catch {
    return null;
  }
}

/** All of the client's jobs as view models (resilient: [] on error). */
async function fetchAllClientJobs(userId: string): Promise<ClientJobView[]> {
  try {
    const supabase = createClient();
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", userId);
    if (error || !jobs || jobs.length === 0) return [];

    // Locations (client can read own).
    const locIds = [
      ...new Set(
        jobs
          .map((j: JobRow) => j.location_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const locs = locIds.length
      ? (
          await supabase.from("service_locations").select("*").in("id", locIds)
        ).data
      : [];
    const locMap = new Map((locs ?? []).map((l) => [l.id, l]));

    // Assigned contractor first names — read with the service client (clients
    // can't read job_assignments/other profiles under RLS), scoped to own jobs.
    const jobIds = jobs.map((j: JobRow) => j.id);
    const contractorByJob = new Map<string, string>();
    try {
      const admin = createServiceClient();
      const { data: assignments } = await admin
        .from("job_assignments")
        .select("job_id, contractor_id, status")
        .in("job_id", jobIds)
        .in("status", ["accepted", "completed", "offered"]);
      const contractorIds = [
        ...new Set((assignments ?? []).map((a) => a.contractor_id)),
      ];
      const { data: profs } = contractorIds.length
        ? await admin
            .from("profiles")
            .select("id, first_name")
            .in("id", contractorIds)
        : { data: [] };
      const nameById = new Map(
        (profs ?? []).map((p) => [p.id, p.first_name ?? null]),
      );
      for (const a of assignments ?? []) {
        if (!contractorByJob.has(a.job_id)) {
          const name = nameById.get(a.contractor_id);
          if (name) contractorByJob.set(a.job_id, name);
        }
      }
    } catch {
      /* contractor names are non-essential */
    }

    return jobs.map((j: JobRow): ClientJobView => {
      const loc = j.location_id ? locMap.get(j.location_id) : undefined;
      const addr = addressOf(loc);
      return {
        jobId: j.id,
        jobNumber: j.job_number,
        serviceType: j.service_type,
        status: j.status,
        scheduledDate: j.scheduled_date,
        scheduledTime: j.scheduled_time,
        locationId: j.location_id,
        locationLabel: addr.label,
        fullAddress: addr.full,
        city: addr.city,
        contractorFirstName: contractorByJob.get(j.id) ?? null,
        totalClientPrice: j.total_client_price,
        clientPrice: j.client_price,
        invoiceStatus: j.invoice_status,
        invoiceSentAt: j.invoice_sent_at,
        invoicePaidAt: j.invoice_paid_at,
      };
    });
  } catch {
    return [];
  }
}

const UPCOMING_STATUSES: JobStatus[] = ["pending", "assigned", "in_progress"];

export interface ClientDashboardData {
  nextAppointment: ClientJobView | null;
  totalJobs: number;
  totalSpent: number;
  upcoming: ClientJobView[];
  recent: ClientJobView[];
}

export async function getClientDashboard(
  ctx: ClientContext,
): Promise<ClientDashboardData> {
  const all = await fetchAllClientJobs(ctx.userId);
  const upcoming = all
    .filter((j) => UPCOMING_STATUSES.includes(j.status))
    .sort((a, b) =>
      (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""),
    );
  const recent = all
    .filter((j) => j.status === "completed")
    .sort((a, b) => (b.scheduledDate ?? "").localeCompare(a.scheduledDate ?? ""))
    .slice(0, 5);
  return {
    nextAppointment: upcoming[0] ?? null,
    totalJobs: ctx.client?.total_jobs ?? 0,
    totalSpent: ctx.client?.total_spent ?? 0,
    upcoming,
    recent,
  };
}

export interface LocationOption {
  id: string;
  label: string;
}

export async function getClientBookings(ctx: ClientContext): Promise<{
  upcoming: ClientJobView[];
  past: ClientJobView[];
  locations: LocationOption[];
}> {
  const all = await fetchAllClientJobs(ctx.userId);
  const upcoming = all
    .filter((j) => UPCOMING_STATUSES.includes(j.status))
    .sort((a, b) =>
      (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""),
    );
  const past = all
    .filter((j) => j.status === "completed" || j.status === "cancelled")
    .sort((a, b) =>
      (b.scheduledDate ?? "").localeCompare(a.scheduledDate ?? ""),
    );
  const locations = await getClientLocations(ctx);
  return {
    upcoming,
    past,
    locations: locations.map((l) => ({
      id: l.id,
      label: l.nickname || l.city || l.street_address || "Property",
    })),
  };
}

export async function getClientInvoices(ctx: ClientContext): Promise<{
  rows: ClientJobView[];
  overdueCount: number;
}> {
  const all = await fetchAllClientJobs(ctx.userId);
  const rows = all.sort((a, b) =>
    (b.scheduledDate ?? "").localeCompare(a.scheduledDate ?? ""),
  );
  const overdueCount = rows.filter((r) => r.invoiceStatus === "overdue").length;
  return { rows, overdueCount };
}

export async function getClientLocations(
  ctx: ClientContext,
): Promise<LocationRow[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("service_locations")
      .select("*")
      .eq("client_id", ctx.userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export type { LocationRow, PropertyType };
