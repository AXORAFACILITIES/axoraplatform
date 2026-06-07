"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { locationInputSchema, type LocationInput } from "@/lib/validations/location";

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

export async function createLocation(input: LocationInput): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };

    const parsed = locationInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Please complete the required fields." };
    }

    // RLS requires client_id = auth.uid(); the client's own session inserts.
    const supabase = createClient();
    const { error } = await supabase
      .from("service_locations")
      .insert({ ...parsed.data, client_id: userId });
    if (error) return { ok: false, error: "Could not save the property." };

    revalidatePath("/client/locations");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the property. Please try again." };
  }
}

export async function updateLocation(
  id: string,
  input: LocationInput,
): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };

    const parsed = locationInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Please complete the required fields." };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("service_locations")
      .update(parsed.data)
      .eq("id", id);
    if (error) return { ok: false, error: "Could not update the property." };

    revalidatePath("/client/locations");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the property. Please try again." };
  }
}

export async function archiveLocation(id: string): Promise<ActionResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Not signed in." };

    const supabase = createClient();
    const { error } = await supabase
      .from("service_locations")
      .update({ is_active: false })
      .eq("id", id);
    if (error) return { ok: false, error: "Could not archive the property." };

    revalidatePath("/client/locations");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not archive the property. Please try again." };
  }
}
