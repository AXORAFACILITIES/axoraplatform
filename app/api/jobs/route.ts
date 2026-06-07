import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/** Returns jobs visible to the authenticated user. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // TODO: query the `jobs` table (RLS scopes rows by role) once the schema exists.
  // const { data, error } = await supabase.from("jobs").select("*");
  return NextResponse.json({ jobs: [] });
}

const createJobSchema = z.object({
  title: z.string().min(2),
  clientId: z.string().uuid().optional(),
  scheduledFor: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

/** Creates a job (admin only — enforced via RLS / role check). */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // TODO: insert into the `jobs` table once the schema exists.
  // const { data, error } = await supabase.from("jobs").insert(parsed.data).select().single();
  return NextResponse.json({ ok: true, job: parsed.data }, { status: 201 });
}
