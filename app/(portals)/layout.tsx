import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/middleware";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function PortalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware guards these routes, but guard again so `role` is always defined.
  const role = user?.user_metadata?.role as UserRole | undefined;
  if (!user || !role) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header userId={user.id} userEmail={user.email ?? undefined} />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <MobileBottomNav role={role} />
    </div>
  );
}
