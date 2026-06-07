"use server";

import { revalidatePath } from "next/cache";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  sendContractorApproved,
  sendContractorRejected,
  sendJobAssigned,
} from "@/lib/email";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Json, ServiceType, QuoteStatus } from "@/lib/types/database.types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ---- Applications ---------------------------------------------------------
export async function approveApplication(
  applicationId: string,
): Promise<ActionResult> {
  try {
    const adminId = await currentUserId();
    if (!adminId) return { ok: false, error: "Not signed in." };

    const supabase = createClient();
    const { data: app } = await supabase
      .from("contractor_applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();
    if (!app) return { ok: false, error: "Application not found." };
    if (app.profile_id) return { ok: false, error: "Already approved." };

    const svc = createServiceClient();
    const tempPassword = `${crypto.randomUUID()}Aa1!`;
    const { data: created, error: createErr } = await svc.auth.admin.createUser(
      {
        email: app.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          role: "contractor",
          first_name: app.first_name,
          last_name: app.last_name,
        },
      },
    );
    if (createErr || !created?.user) {
      return {
        ok: false,
        error: createErr?.message ?? "Could not create the contractor account.",
      };
    }
    const uid = created.user.id;

    // The handle_new_user trigger created the profile; add the contractor row.
    await svc.from("contractors").insert({
      id: uid,
      application_id: app.id,
      services_offered: app.services_offered,
      service_areas: app.service_areas,
      available_days: app.available_days,
      has_team: app.has_team,
      team_size: app.team_size,
      has_own_supplies: app.has_own_supplies,
    });

    await supabase
      .from("contractor_applications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        profile_id: uid,
      })
      .eq("id", applicationId);

    await sendContractorApproved({ to: app.email, firstName: app.first_name });

    revalidatePath("/admin/contractors");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("approveApplication failed", err);
    return { ok: false, error: "Could not approve the application." };
  }
}

export async function rejectApplication(
  applicationId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const adminId = await currentUserId();
    if (!adminId) return { ok: false, error: "Not signed in." };

    const supabase = createClient();
    const { data: app } = await supabase
      .from("contractor_applications")
      .select("email, first_name")
      .eq("id", applicationId)
      .maybeSingle();

    const { error } = await supabase
      .from("contractor_applications")
      .update({
        status: "rejected",
        rejection_reason: reason || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", applicationId);
    if (error) return { ok: false, error: "Could not update the application." };

    if (app?.email) {
      await sendContractorRejected({
        to: app.email,
        firstName: app.first_name ?? "there",
        reason: reason || null,
      });
    }

    revalidatePath("/admin/contractors");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reject the application." };
  }
}

export async function holdApplication(
  applicationId: string,
): Promise<ActionResult> {
  try {
    const adminId = await currentUserId();
    if (!adminId) return { ok: false, error: "Not signed in." };
    const supabase = createClient();
    const { error } = await supabase
      .from("contractor_applications")
      .update({
        status: "on_hold",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", applicationId);
    if (error) return { ok: false, error: "Could not update the application." };
    revalidatePath("/admin/contractors");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the application." };
  }
}

export async function toggleContractorActive(
  contractorId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("contractors")
      .update({ is_active: isActive })
      .eq("id", contractorId);
    if (error) return { ok: false, error: "Could not update the contractor." };
    revalidatePath("/admin/contractors");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the contractor." };
  }
}

// ---- Jobs -----------------------------------------------------------------
export interface CreateJobInput {
  clientId: string;
  locationId?: string | null;
  newLocation?: {
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    property_type:
      | "house"
      | "apartment"
      | "condo"
      | "commercial"
      | "airbnb"
      | "multi_unit";
  } | null;
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTime?: string | null;
  durationHours?: number | null;
  isRush: boolean;
  rushFee?: number | null;
  addOns?: { name: string; price: number }[];
  specialInstructions?: string | null;
  clientPrice: number;
  contractorIds: string[];
}

export async function createJob(input: CreateJobInput): Promise<ActionResult> {
  try {
    const adminId = await currentUserId();
    if (!adminId) return { ok: false, error: "Not signed in." };
    if (!input.clientId) return { ok: false, error: "Select a client." };

    const supabase = createClient();

    let locationId = input.locationId ?? null;
    if (!locationId && input.newLocation) {
      const { data: loc, error: locErr } = await supabase
        .from("service_locations")
        .insert({ ...input.newLocation, client_id: input.clientId })
        .select("id")
        .single();
      if (locErr || !loc) return { ok: false, error: "Could not save the address." };
      locationId = loc.id;
    }

    const addOns = input.addOns ?? [];
    const addOnsTotal = addOns.reduce((s, a) => s + (Number(a.price) || 0), 0);

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .insert({
        client_id: input.clientId,
        location_id: locationId,
        service_type: input.serviceType,
        status: input.contractorIds.length ? "assigned" : "pending",
        scheduled_date: input.scheduledDate || null,
        scheduled_time: input.scheduledTime || null,
        estimated_duration_hours: input.durationHours ?? null,
        is_rush: input.isRush,
        rush_fee: input.rushFee ?? 0,
        add_ons: (addOns as unknown as Json) ?? null,
        add_ons_total: addOnsTotal,
        client_price: input.clientPrice,
        special_instructions: input.specialInstructions || null,
        checklist_type: input.serviceType,
        created_by: adminId,
      })
      .select("id, contractor_payout")
      .single();
    if (jobErr || !job) return { ok: false, error: "Could not create the job." };

    if (input.contractorIds.length) {
      const per =
        Math.round(
          ((job.contractor_payout ?? 0) / input.contractorIds.length) * 100,
        ) / 100;
      await supabase.from("job_assignments").insert(
        input.contractorIds.map((cid) => ({
          job_id: job.id,
          contractor_id: cid,
          assigned_by: adminId,
          status: "offered" as const,
          payout_amount: per,
        })),
      );
      await supabase.from("notifications").insert(
        input.contractorIds.map((cid) => ({
          recipient_id: cid,
          type: "new_job_offer",
          title: "New job offer",
          message: "You have a new job offer. Open your portal to respond.",
          job_id: job.id,
        })),
      );

      const { data: cprofiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", input.contractorIds);
      const offerCity = input.newLocation?.city ?? "";
      await Promise.all(
        (cprofiles ?? []).map((p) =>
          p.email
            ? sendJobAssigned({
                to: p.email,
                serviceType: SERVICE_TYPE_LABELS[input.serviceType],
                date: formatDate(input.scheduledDate),
                city: offerCity,
                payout: formatCurrency(per),
              })
            : Promise.resolve(),
        ),
      );
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("createJob failed", err);
    return { ok: false, error: "Could not create the job." };
  }
}

export async function markInvoice(
  jobId: string,
  status: "sent" | "paid",
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const patch =
      status === "sent"
        ? { invoice_status: "sent" as const, invoice_sent_at: now }
        : { invoice_status: "paid" as const, invoice_paid_at: now };
    const { error } = await supabase.from("jobs").update(patch).eq("id", jobId);
    if (error) return { ok: false, error: "Could not update the invoice." };
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the invoice." };
  }
}

export async function setJobStatus(
  jobId: string,
  status: "completed" | "cancelled",
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", jobId);
    if (error) return { ok: false, error: "Could not update the job." };
    revalidatePath("/admin/jobs");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the job." };
  }
}

// ---- Quote requests -------------------------------------------------------
export async function updateQuote(
  id: string,
  patch: { status?: QuoteStatus; admin_notes?: string; quoted_price?: number | null },
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.admin_notes !== undefined
          ? { admin_notes: patch.admin_notes }
          : {}),
        ...(patch.quoted_price !== undefined
          ? { quoted_price: patch.quoted_price }
          : {}),
      })
      .eq("id", id);
    if (error) return { ok: false, error: "Could not update the quote." };
    revalidatePath("/admin/quote-requests");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the quote." };
  }
}

// ---- Settings -------------------------------------------------------------
export interface SettingsInput {
  contractorPayoutPercent: number;
  adminEmail: string;
  emailOnApplication: boolean;
  emailOnCompletion: boolean;
  emailOnQuote: boolean;
  serviceAreas: string[];
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    const adminId = await currentUserId();
    const supabase = createClient();
    const rows = [
      {
        key: "pricing",
        value: {
          contractor_payout_percent: input.contractorPayoutPercent,
          service_base_prices: {},
        } as unknown as Json,
        updated_by: adminId,
      },
      {
        key: "notifications",
        value: {
          admin_email: input.adminEmail,
          email_on_application: input.emailOnApplication,
          email_on_completion: input.emailOnCompletion,
          email_on_quote: input.emailOnQuote,
        } as unknown as Json,
        updated_by: adminId,
      },
      {
        key: "service_areas",
        value: input.serviceAreas as unknown as Json,
        updated_by: adminId,
      },
    ];
    const { error } = await supabase
      .from("app_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) return { ok: false, error: "Could not save settings." };
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save settings." };
  }
}
