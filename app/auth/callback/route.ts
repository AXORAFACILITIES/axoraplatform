import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/middleware";

const ROLE_HOME: Record<UserRole, string> = {
  contractor: "/worker",
  client: "/client",
  admin: "/admin",
};

/**
 * Post-auth router. Exchanges an OAuth/magic-link `code` if present, then reads
 * the user's authoritative role from `profiles` and sends them to their portal
 * (or to the original `redirect` target).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  const supabase = createClient();
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role ??
    (user.user_metadata?.role as UserRole | undefined)) as
    | UserRole
    | undefined;

  return NextResponse.redirect(`${origin}${role ? ROLE_HOME[role] : "/"}`);
}
