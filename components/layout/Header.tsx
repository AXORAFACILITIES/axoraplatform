import Link from "next/link";

import { NotificationBell } from "./NotificationBell";

export interface HeaderProps {
  userId: string;
  userEmail?: string;
}

export function Header({ userId, userEmail }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-axora-slate bg-white px-4 md:px-6">
      <span className="text-base font-semibold text-axora-navy md:hidden">
        Axora
      </span>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell userId={userId} />
        {userEmail ? (
          <span className="hidden text-sm text-axora-navy/70 sm:inline">
            {userEmail}
          </span>
        ) : null}
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-axora-navy hover:bg-axora-slate/40"
          >
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="hidden text-sm font-medium text-axora-blue hover:underline sm:inline"
        >
          Site
        </Link>
      </div>
    </header>
  );
}
