import { createClient } from "@/lib/supabase/server";
import type {
  Database,
  ServiceType,
  JobStatus,
  InvoiceStatus,
  ApplicationStatus,
  ClientType,
} from "@/lib/types/database.types";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type LocationRow = Database["public"]["Tables"]["service_locations"]["Row"];
type ApplicationRow =
  Database["public"]["Tables"]["contractor_applications"]["Row"];
type QuoteRow = Database["public"]["Tables"]["quote_requests"]["Row"];

const ym = () => new Date().toISOString().slice(0, 7);
const todayStr = () => new Date().toISOString().slice(0, 10);

function nameOf(p?: { first_name: string | null; last_name: string | null }) {
  if (!p) return "—";
  return [p.first_name, p.last_name].filter(Boolean).join(" ") || "—";
}

export interface AdminJobView {
  id: string;
  jobNumber: string | null;
  serviceType: ServiceType;
  status: JobStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  clientId: string | null;
  clientName: string;
  locationId: string | null;
  address: string | null;
  city: string | null;
  contractorNames: string[];
  clientPrice: number | null;
  contractorPayout: number | null;
  axoraMargin: number | null;
  totalClientPrice: number | null;
  invoiceStatus: InvoiceStatus;
  invoiceSentAt: string | null;
  invoicePaidAt: string | null;
  isRush: boolean;
  specialInstructions: string | null;
}

async function enrichJobs(
  supabase: ReturnType<typeof createClient>,
  jobs: JobRow[],
): Promise<AdminJobView[]> {
  if (jobs.length === 0) return [];

  const clientIds = [
    ...new Set(jobs.map((j) => j.client_id).filter((x): x is string => !!x)),
  ];
  const locIds = [
    ...new Set(jobs.map((j) => j.location_id).filter((x): x is string => !!x)),
  ];
  const jobIds = jobs.map((j) => j.id);

  const [clientProfilesRes, locsRes, assignmentsRes] = await Promise.all([
    clientIds.length
      ? supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", clientIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string | null; last_name: string | null }[] }),
    locIds.length
      ? supabase.from("service_locations").select("*").in("id", locIds)
      : Promise.resolve({ data: [] as LocationRow[] }),
    supabase
      .from("job_assignments")
      .select("job_id, contractor_id, status")
      .in("job_id", jobIds),
  ]);

  const clientNameById = new Map(
    (clientProfilesRes.data ?? []).map((p) => [p.id, nameOf(p)]),
  );
  const locById = new Map((locsRes.data ?? []).map((l) => [l.id, l]));

  const assignments = assignmentsRes.data ?? [];
  const contractorIds = [
    ...new Set(assignments.map((a) => a.contractor_id)),
  ];
  const contractorProfiles = contractorIds.length
    ? (
        await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", contractorIds)
      ).data ?? []
    : [];
  const contractorNameById = new Map(
    contractorProfiles.map((p) => [p.id, nameOf(p)]),
  );
  const namesByJob = new Map<string, string[]>();
  for (const a of assignments) {
    if (a.status === "declined" || a.status === "removed") continue;
    const list = namesByJob.get(a.job_id) ?? [];
    const nm = contractorNameById.get(a.contractor_id);
    if (nm) list.push(nm);
    namesByJob.set(a.job_id, list);
  }

  return jobs.map((j): AdminJobView => {
    const loc = j.location_id ? locById.get(j.location_id) : undefined;
    const address = loc
      ? [loc.street_address, [loc.city, loc.state].filter(Boolean).join(", "), loc.zip_code]
          .filter(Boolean)
          .join(", ") || null
      : null;
    return {
      id: j.id,
      jobNumber: j.job_number,
      serviceType: j.service_type,
      status: j.status,
      scheduledDate: j.scheduled_date,
      scheduledTime: j.scheduled_time,
      clientId: j.client_id,
      clientName: j.client_id ? clientNameById.get(j.client_id) ?? "—" : "—",
      locationId: j.location_id,
      address,
      city: loc?.city ?? null,
      contractorNames: namesByJob.get(j.id) ?? [],
      clientPrice: j.client_price,
      contractorPayout: j.contractor_payout,
      axoraMargin: j.axora_margin,
      totalClientPrice: j.total_client_price,
      invoiceStatus: j.invoice_status,
      invoiceSentAt: j.invoice_sent_at,
      invoicePaidAt: j.invoice_paid_at,
      isRush: j.is_rush,
      specialInstructions: j.special_instructions,
    };
  });
}

export interface AdminOverview {
  jobsThisMonth: number;
  revenueThisMonth: number;
  marginThisMonth: number;
  pendingApplications: number;
  jobsByStatus: Record<JobStatus, number>;
  invoicesAttention: number;
  todaysJobs: AdminJobView[];
  recentApplications: ApplicationRow[];
  recentQuotes: QuoteRow[];
}

const EMPTY_STATUS: Record<JobStatus, number> = {
  pending: 0,
  assigned: 0,
  in_progress: 0,
  completed: 0,
  cancelled: 0,
  disputed: 0,
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const base: AdminOverview = {
    jobsThisMonth: 0,
    revenueThisMonth: 0,
    marginThisMonth: 0,
    pendingApplications: 0,
    jobsByStatus: { ...EMPTY_STATUS },
    invoicesAttention: 0,
    todaysJobs: [],
    recentApplications: [],
    recentQuotes: [],
  };
  try {
    const supabase = createClient();
    const [jobsRes, appsRes, quotesRes] = await Promise.all([
      supabase.from("jobs").select("*"),
      supabase
        .from("contractor_applications")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("quote_requests")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: false }),
    ]);

    const jobs = jobsRes.data ?? [];
    const enriched = await enrichJobs(supabase, jobs);

    const month = ym();
    const today = todayStr();
    const byStatus = { ...EMPTY_STATUS };
    for (const j of enriched) byStatus[j.status] += 1;

    const completedThisMonth = enriched.filter(
      (j) => j.status === "completed" && (j.scheduledDate ?? "").startsWith(month),
    );

    base.jobsThisMonth = enriched.filter((j) =>
      (j.scheduledDate ?? "").startsWith(month),
    ).length;
    base.revenueThisMonth = completedThisMonth.reduce(
      (s, j) => s + (j.totalClientPrice ?? j.clientPrice ?? 0),
      0,
    );
    base.marginThisMonth = completedThisMonth.reduce(
      (s, j) => s + (j.axoraMargin ?? 0),
      0,
    );
    base.jobsByStatus = byStatus;
    base.invoicesAttention = enriched.filter(
      (j) => j.invoiceStatus === "not_sent" || j.invoiceStatus === "overdue",
    ).length;
    base.todaysJobs = enriched.filter((j) => j.scheduledDate === today);
    base.pendingApplications = (appsRes.data ?? []).length;
    base.recentApplications = (appsRes.data ?? []).slice(0, 5);
    base.recentQuotes = (quotesRes.data ?? []).slice(0, 5);
    return base;
  } catch {
    return base;
  }
}

export async function getApplications(
  status?: ApplicationStatus,
): Promise<ApplicationRow[]> {
  try {
    const supabase = createClient();
    let q = supabase
      .from("contractor_applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data } = await q;
    return data ?? [];
  } catch {
    return [];
  }
}

export interface RosterRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  services: string[];
  areas: string[];
  jobsCompleted: number;
  totalEarnings: number;
  isActive: boolean;
}

export async function getRoster(): Promise<RosterRow[]> {
  try {
    const supabase = createClient();
    const { data: contractors } = await supabase
      .from("contractors")
      .select("*");
    if (!contractors?.length) return [];
    const ids = contractors.map((c) => c.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone")
      .in("id", ids);
    const pById = new Map((profiles ?? []).map((p) => [p.id, p]));
    return contractors.map((c) => {
      const p = pById.get(c.id);
      return {
        id: c.id,
        name: nameOf(p),
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        services: c.services_offered ?? [],
        areas: c.service_areas ?? [],
        jobsCompleted: c.total_jobs_completed,
        totalEarnings: c.total_earnings,
        isActive: c.is_active,
      };
    });
  } catch {
    return [];
  }
}

export async function getAdminJobs(): Promise<AdminJobView[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("scheduled_date", { ascending: false });
    return enrichJobs(supabase, data ?? []);
  } catch {
    return [];
  }
}

export interface AdminClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  clientType: ClientType;
  companyName: string | null;
  totalJobs: number;
  totalSpent: number;
}

export async function getAdminClients(): Promise<AdminClientRow[]> {
  try {
    const supabase = createClient();
    const { data: clients } = await supabase.from("clients").select("*");
    if (!clients?.length) return [];
    const ids = clients.map((c) => c.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone")
      .in("id", ids);
    const pById = new Map((profiles ?? []).map((p) => [p.id, p]));
    return clients.map((c) => {
      const p = pById.get(c.id);
      return {
        id: c.id,
        name: nameOf(p),
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        clientType: c.client_type,
        companyName: c.company_name,
        totalJobs: c.total_jobs,
        totalSpent: c.total_spent,
      };
    });
  } catch {
    return [];
  }
}

export async function getQuoteRequests(): Promise<QuoteRow[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export interface AdminSettings {
  contractorPayoutPercent: number;
  adminEmail: string;
  emailOnApplication: boolean;
  emailOnCompletion: boolean;
  emailOnQuote: boolean;
  serviceAreas: string[];
}

const DEFAULT_SETTINGS: AdminSettings = {
  contractorPayoutPercent: 48,
  adminEmail: "",
  emailOnApplication: true,
  emailOnCompletion: true,
  emailOnQuote: true,
  serviceAreas: [],
};

export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("app_settings").select("*");
    const byKey = new Map((data ?? []).map((r) => [r.key, r.value]));
    const pricing = (byKey.get("pricing") ?? {}) as Record<string, unknown>;
    const notif = (byKey.get("notifications") ?? {}) as Record<string, unknown>;
    const areas = byKey.get("service_areas");
    return {
      contractorPayoutPercent:
        typeof pricing.contractor_payout_percent === "number"
          ? pricing.contractor_payout_percent
          : 48,
      adminEmail: typeof notif.admin_email === "string" ? notif.admin_email : "",
      emailOnApplication: notif.email_on_application !== false,
      emailOnCompletion: notif.email_on_completion !== false,
      emailOnQuote: notif.email_on_quote !== false,
      serviceAreas: Array.isArray(areas) ? (areas as string[]) : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ---- Select helpers for the Create Job flow -------------------------------
export interface SelectOption {
  id: string;
  label: string;
}

export async function getClientOptions(): Promise<SelectOption[]> {
  try {
    const supabase = createClient();
    const { data: clients } = await supabase.from("clients").select("id");
    if (!clients?.length) return [];
    const ids = clients.map((c) => c.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", ids);
    return (profiles ?? []).map((p) => ({
      id: p.id,
      label: `${nameOf(p)}${p.email ? ` · ${p.email}` : ""}`,
    }));
  } catch {
    return [];
  }
}

export interface ContractorOption {
  id: string;
  name: string;
  services: string[];
  areas: string[];
  jobsCompleted: number;
}

export async function getContractorOptions(): Promise<ContractorOption[]> {
  try {
    const supabase = createClient();
    const { data: contractors } = await supabase
      .from("contractors")
      .select("*")
      .eq("is_active", true);
    if (!contractors?.length) return [];
    const ids = contractors.map((c) => c.id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", ids);
    const pById = new Map((profiles ?? []).map((p) => [p.id, p]));
    return contractors.map((c) => ({
      id: c.id,
      name: nameOf(pById.get(c.id)),
      services: c.services_offered ?? [],
      areas: c.service_areas ?? [],
      jobsCompleted: c.total_jobs_completed,
    }));
  } catch {
    return [];
  }
}

export async function getLocationsByClient(): Promise<
  Record<string, SelectOption[]>
> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("service_locations")
      .select("id, client_id, nickname, street_address, city")
      .eq("is_active", true);
    const map: Record<string, SelectOption[]> = {};
    for (const l of data ?? []) {
      const label = l.nickname || l.city || l.street_address || "Property";
      (map[l.client_id] ??= []).push({ id: l.id, label });
    }
    return map;
  } catch {
    return {};
  }
}

export type { QuoteRow, ApplicationRow };
