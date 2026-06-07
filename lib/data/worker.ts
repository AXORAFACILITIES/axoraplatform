import { createClient } from "@/lib/supabase/server";
import { monthBounds } from "@/lib/format";
import type {
  Database,
  ServiceType,
  JobStatus,
  AssignmentStatus,
  PayoutStatus,
  PropertyType,
} from "@/lib/types/database.types";

type AssignmentRow =
  Database["public"]["Tables"]["job_assignments"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type LocationRow = Database["public"]["Tables"]["service_locations"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ContractorRow = Database["public"]["Tables"]["contractors"]["Row"];

export interface WorkerJobView {
  assignmentId: string;
  jobId: string;
  jobNumber: string | null;
  serviceType: ServiceType;
  jobStatus: JobStatus;
  assignmentStatus: AssignmentStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedDurationHours: number | null;
  city: string | null;
  fullAddress: string | null;
  propertyType: PropertyType | null;
  payout: number | null;
  payoutStatus: PayoutStatus;
  clientPrice: number | null;
  totalClientPrice: number | null;
  specialInstructions: string | null;
  completedAt: string | null;
}

export interface WorkerContext {
  userId: string;
  profile: ProfileRow | null;
  contractor: ContractorRow | null;
}

function buildAddress(loc: LocationRow | undefined): {
  city: string | null;
  full: string | null;
  propertyType: PropertyType | null;
} {
  if (!loc) return { city: null, full: null, propertyType: null };
  const parts = [
    loc.street_address,
    [loc.city, loc.state].filter(Boolean).join(", "),
    loc.zip_code,
  ].filter(Boolean);
  return {
    city: loc.city ?? null,
    full: parts.length ? parts.join(" · ") : null,
    propertyType: loc.property_type ?? null,
  };
}

function toView(
  a: AssignmentRow,
  job: JobRow | undefined,
  loc: LocationRow | undefined,
): WorkerJobView | null {
  if (!job) return null;
  const addr = buildAddress(loc);
  return {
    assignmentId: a.id,
    jobId: job.id,
    jobNumber: job.job_number,
    serviceType: job.service_type,
    jobStatus: job.status,
    assignmentStatus: a.status,
    scheduledDate: job.scheduled_date,
    scheduledTime: job.scheduled_time,
    estimatedDurationHours: job.estimated_duration_hours,
    city: addr.city,
    fullAddress: addr.full,
    propertyType: addr.propertyType,
    payout: a.payout_amount,
    payoutStatus: a.payout_status,
    clientPrice: job.client_price,
    totalClientPrice: job.total_client_price,
    specialInstructions: job.special_instructions,
    completedAt: a.completed_at,
  };
}

/**
 * Loads assignments for a contractor and stitches in their jobs + locations.
 * Returns [] on any error (e.g. before Supabase is connected).
 */
async function fetchAssignments(
  contractorId: string,
  statuses?: AssignmentStatus[],
): Promise<WorkerJobView[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("job_assignments")
      .select("*")
      .eq("contractor_id", contractorId);
    if (statuses?.length) query = query.in("status", statuses);

    const { data: assignments, error } = await query;
    if (error || !assignments || assignments.length === 0) return [];

    const jobIds = [...new Set(assignments.map((a) => a.job_id))];
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .in("id", jobIds);
    const jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));

    const locIds = [
      ...new Set(
        (jobs ?? [])
          .map((j) => j.location_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const locs = locIds.length
      ? (
          await supabase
            .from("service_locations")
            .select("*")
            .in("id", locIds)
        ).data
      : [];
    const locMap = new Map((locs ?? []).map((l) => [l.id, l]));

    return assignments
      .map((a) => {
        const job = jobMap.get(a.job_id);
        const loc = job?.location_id ? locMap.get(job.location_id) : undefined;
        return toView(a, job, loc);
      })
      .filter((v): v is WorkerJobView => v !== null);
  } catch {
    return [];
  }
}

export async function getWorkerContext(): Promise<WorkerContext | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [profileRes, contractorRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("contractors").select("*").eq("id", user.id).maybeSingle(),
    ]);

    return {
      userId: user.id,
      profile: profileRes.data ?? null,
      contractor: contractorRes.data ?? null,
    };
  } catch {
    return null;
  }
}

export interface WorkerDashboardData {
  jobsThisMonth: number;
  earningsThisMonth: number;
  jobsAllTime: number;
  totalEarnings: number;
  offered: WorkerJobView[];
  upcoming: WorkerJobView[];
}

export async function getWorkerDashboard(
  ctx: WorkerContext,
): Promise<WorkerDashboardData> {
  const base: WorkerDashboardData = {
    jobsThisMonth: 0,
    earningsThisMonth: 0,
    jobsAllTime: ctx.contractor?.total_jobs_completed ?? 0,
    totalEarnings: ctx.contractor?.total_earnings ?? 0,
    offered: [],
    upcoming: [],
  };
  if (!ctx.contractor) return base;

  const [offered, accepted, completed] = await Promise.all([
    fetchAssignments(ctx.contractor.id, ["offered"]),
    fetchAssignments(ctx.contractor.id, ["accepted"]),
    fetchAssignments(ctx.contractor.id, ["completed"]),
  ]);

  const { start, end } = monthBounds();
  const inMonth = (iso: string | null) =>
    iso != null && iso >= start && iso < end;

  base.offered = offered;
  base.upcoming = accepted;
  base.jobsThisMonth = completed.filter((c) =>
    inMonth(c.completedAt),
  ).length;
  base.earningsThisMonth = completed
    .filter((c) => c.payoutStatus === "paid" && inMonth(c.completedAt))
    .reduce((sum, c) => sum + (c.payout ?? 0), 0);

  return base;
}

export async function getWorkerJobs(ctx: WorkerContext): Promise<{
  available: WorkerJobView[];
  myJobs: WorkerJobView[];
}> {
  if (!ctx.contractor) return { available: [], myJobs: [] };
  const [available, myJobs] = await Promise.all([
    fetchAssignments(ctx.contractor.id, ["offered"]),
    fetchAssignments(ctx.contractor.id, ["accepted"]),
  ]);
  return { available, myJobs };
}

export async function getWorkerHistory(
  ctx: WorkerContext,
  month?: string,
): Promise<{ rows: WorkerJobView[]; totalForPeriod: number }> {
  if (!ctx.contractor) return { rows: [], totalForPeriod: 0 };
  let rows = await fetchAssignments(ctx.contractor.id, ["completed"]);

  if (month) {
    // month is "YYYY-MM"
    rows = rows.filter((r) => (r.completedAt ?? "").startsWith(month));
  }
  rows.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  const totalForPeriod = rows.reduce((sum, r) => sum + (r.payout ?? 0), 0);
  return { rows, totalForPeriod };
}
