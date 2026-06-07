"use server";

import { revalidatePath } from "next/cache";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

type Service = SupabaseClient<Database>;

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Resolves the current authenticated user id, or null. */
async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Confirms the assignment exists and belongs to the current contractor. */
async function ownsAssignment(
  userId: string,
  assignmentId: string,
): Promise<{ id: string; job_id: string } | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("job_assignments")
    .select("id, job_id, contractor_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!data || data.contractor_id !== userId) return null;
  return { id: data.id, job_id: data.job_id };
}

async function notifyAdmins(
  admin: Service,
  type: string,
  title: string,
  message: string,
  jobId?: string,
): Promise<void> {
  const { data: admins } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  if (!admins?.length) return;
  await admin.from("notifications").insert(
    admins.map((a) => ({
      recipient_id: a.id,
      type,
      title,
      message,
      job_id: jobId ?? null,
    })),
  );
}

export async function acceptAssignment(
  assignmentId: string,
): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };
    const owned = await ownsAssignment(userId, assignmentId);
    if (!owned) return { ok: false, error: "Job not found." };

    const admin = createServiceClient();
    await admin
      .from("job_assignments")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", assignmentId);
    await admin.from("jobs").update({ status: "assigned" }).eq("id", owned.job_id);
    await notifyAdmins(
      admin,
      "job_accepted",
      "Job offer accepted",
      "A contractor accepted a job offer.",
      owned.job_id,
    );

    revalidatePath("/worker");
    revalidatePath("/worker/jobs");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not accept the job. Please try again." };
  }
}

export async function declineAssignment(
  assignmentId: string,
): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };
    const owned = await ownsAssignment(userId, assignmentId);
    if (!owned) return { ok: false, error: "Job not found." };

    const admin = createServiceClient();
    await admin
      .from("job_assignments")
      .update({ status: "declined" })
      .eq("id", assignmentId);

    revalidatePath("/worker");
    revalidatePath("/worker/jobs");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not decline the job. Please try again." };
  }
}

export interface CompletionInput {
  assignmentId: string;
  beforePhotos: string[];
  afterPhotos: string[];
  damageReported: boolean;
  damageDescription?: string;
  damagePhotos?: string[];
  completionNotes?: string;
  checklistConfirmed: boolean;
}

export async function submitCompletion(
  input: CompletionInput,
): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };
    const owned = await ownsAssignment(userId, input.assignmentId);
    if (!owned) return { ok: false, error: "Job not found." };
    if (input.beforePhotos.length === 0 || input.afterPhotos.length === 0) {
      return { ok: false, error: "Before and after photos are required." };
    }

    const admin = createServiceClient();
    const now = new Date().toISOString();

    const { error: insertError } = await admin.from("job_completions").insert({
      job_id: owned.job_id,
      assignment_id: owned.id,
      submitted_by: userId,
      before_photos: input.beforePhotos,
      after_photos: input.afterPhotos,
      completion_notes: input.completionNotes || null,
      damage_reported: input.damageReported,
      damage_description: input.damageReported
        ? input.damageDescription || null
        : null,
      damage_photos: input.damageReported ? input.damagePhotos ?? [] : null,
      checklist_completed: { confirmed: input.checklistConfirmed },
    });
    if (insertError) {
      return { ok: false, error: "Could not submit completion." };
    }

    await admin
      .from("job_assignments")
      .update({ status: "completed", completed_at: now })
      .eq("id", owned.id);
    await admin.from("jobs").update({ status: "completed" }).eq("id", owned.job_id);
    await notifyAdmins(
      admin,
      "job_completed",
      "Job completion submitted",
      "A contractor submitted a job completion.",
      owned.job_id,
    );

    revalidatePath("/worker");
    revalidatePath("/worker/jobs");
    revalidatePath("/worker/history");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not submit completion. Please try again." };
  }
}

export interface ProfileUpdateInput {
  phone: string;
  email: string;
  availableDays: string[];
  serviceAreas: string[];
  acceptsShortNotice: boolean;
}

export async function updateContractorProfile(
  input: ProfileUpdateInput,
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not signed in." };

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone: input.phone, email: input.email })
      .eq("id", user.id);

    const { error: contractorError } = await supabase
      .from("contractors")
      .update({
        available_days: input.availableDays,
        service_areas: input.serviceAreas,
        accepts_short_notice: input.acceptsShortNotice,
      })
      .eq("id", user.id);

    if (profileError || contractorError) {
      return { ok: false, error: "Could not save your changes." };
    }

    revalidatePath("/worker/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save your changes. Please try again." };
  }
}
