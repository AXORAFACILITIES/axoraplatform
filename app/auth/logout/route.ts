import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Signs the user out and returns them to the login page. */
export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/auth/login`, { status: 303 });
}
