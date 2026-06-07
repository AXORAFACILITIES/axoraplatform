import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/types/database.types";

export type UserRole = "contractor" | "client" | "admin";

/** Maps a user role to the portal route it owns. */
const ROLE_HOME: Record<UserRole, string> = {
  contractor: "/worker",
  client: "/client",
  admin: "/admin",
};

/** Path prefix -> role required to access it. */
const PROTECTED_PREFIXES: { prefix: string; role: UserRole }[] = [
  { prefix: "/worker", role: "contractor" },
  { prefix: "/client", role: "client" },
  { prefix: "/admin", role: "admin" },
];

/**
 * Refreshes the Supabase auth session on every request and enforces
 * role-based access to the portal routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() must be called to refresh the token. Do not run code
  // between createServerClient and getUser() that could short-circuit.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const role = user?.user_metadata?.role as UserRole | undefined;

  const matched = PROTECTED_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  // Unauthenticated user hitting a protected route -> send to login.
  if (matched && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user in the wrong portal -> send to their own portal.
  if (matched && user && role && role !== matched.role) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? "/auth/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Already authenticated and visiting the login page -> route to their portal.
  if (pathname === "/auth/login" && user && role) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
