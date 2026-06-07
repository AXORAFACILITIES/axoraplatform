import Link from "next/link";

import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-axora-slate bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-axora-navy">
            Axora Facilities
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/onboarding"
              className="text-axora-navy hover:text-axora-blue"
            >
              Become a Contractor
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md bg-axora-blue px-3 py-1.5 text-white hover:bg-axora-navy"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
