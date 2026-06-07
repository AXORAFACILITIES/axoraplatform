import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  User,
  CalendarDays,
  Home,
  Receipt,
  Building2,
  Users,
  Settings,
  ClipboardList,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/lib/supabase/middleware";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Sidebar navigation, keyed by portal role. */
export const PORTAL_NAV: Record<UserRole, NavItem[]> = {
  contractor: [
    { label: "Dashboard", href: "/worker", icon: LayoutDashboard },
    { label: "Jobs", href: "/worker/jobs", icon: Briefcase },
    { label: "Pay History", href: "/worker/history", icon: DollarSign },
    { label: "My Profile", href: "/worker/profile", icon: User },
  ],
  client: [
    { label: "Dashboard", href: "/client", icon: Home },
    { label: "My Bookings", href: "/client/bookings", icon: CalendarDays },
    { label: "Invoices", href: "/client/invoices", icon: Receipt },
    { label: "My Properties", href: "/client/locations", icon: Building2 },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Contractors", href: "/admin/contractors", icon: Users },
    { label: "Jobs", href: "/admin/jobs", icon: ClipboardList },
    { label: "Clients", href: "/admin/clients", icon: Briefcase },
    { label: "Quote Requests", href: "/admin/quote-requests", icon: MessageSquare },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  contractor: "Contractor Portal",
  client: "Client Portal",
  admin: "Admin",
};
