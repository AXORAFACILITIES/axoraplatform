import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ClipboardList, LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "Axora Facilities Portal",
  description:
    "Apply to join the Axora Facilities contractor network, or sign in to the contractor, client, and admin portals.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Hero */}
      <section className="bg-axora-navy px-6 py-16 text-center text-white sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-axora-sky">
          Axora Facilities LLC
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
          The Axora Facilities Portal
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Cleaning &amp; property maintenance for Metro Atlanta. Apply to join
          our contractor network, or sign in to manage your jobs, bookings, and
          invoices.
        </p>
      </section>

      {/* Two paths */}
      <section className="mx-auto -mt-10 w-full max-w-3xl flex-1 px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/onboarding"
            className="group rounded-xl border border-axora-slate bg-white p-6 shadow-sm transition hover:border-axora-blue hover:shadow-md"
          >
            <ClipboardList className="h-8 w-8 text-axora-blue" />
            <h2 className="mt-4 text-lg font-bold text-axora-navy">
              Become a Contractor
            </h2>
            <p className="mt-1 text-sm text-axora-navy/70">
              Independent cleaning pros — apply to join the Axora network and
              start receiving job offers.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-axora-blue">
              Start your application
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="group rounded-xl border border-axora-slate bg-white p-6 shadow-sm transition hover:border-axora-blue hover:shadow-md"
          >
            <LogIn className="h-8 w-8 text-axora-blue" />
            <h2 className="mt-4 text-lg font-bold text-axora-navy">
              Portal Login
            </h2>
            <p className="mt-1 text-sm text-axora-navy/70">
              Contractors, clients, and admins — sign in to your dashboard.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-axora-blue">
              Sign in
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-axora-slate bg-white px-6 py-6 text-center text-sm text-axora-navy/60">
        &copy; {new Date().getFullYear()} Axora Facilities LLC · Metro Atlanta,
        Georgia
      </footer>
    </main>
  );
}
