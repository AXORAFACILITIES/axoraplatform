"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/supabase/middleware";
import { PORTAL_NAV } from "./nav-config";

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = PORTAL_NAV[role];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-axora-slate bg-white md:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              active ? "text-axora-blue" : "text-axora-navy/60",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
