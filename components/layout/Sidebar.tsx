"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Mail } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/supabase/middleware";
import { PORTAL_NAV, ROLE_LABEL } from "./nav-config";

export interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = PORTAL_NAV[role];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-axora-slate bg-white md:flex">
      <div className="flex h-16 items-center border-b border-axora-slate px-6">
        <span className="text-lg font-bold text-axora-navy">Axora</span>
        <span className="ml-2 text-xs font-medium uppercase tracking-wide text-axora-blue">
          {ROLE_LABEL[role]}
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-axora-blue text-white"
                  : "text-axora-navy hover:bg-axora-slate/40",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-axora-slate p-4">
        <a
          href="mailto:info@axorafacilities.com"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-axora-navy hover:bg-axora-slate/40"
        >
          <Mail className="h-5 w-5" />
          Contact Us
        </a>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-axora-navy hover:bg-axora-slate/40"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
