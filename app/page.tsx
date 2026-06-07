import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-axora-navy">Axora Facilities</h1>
        <p className="mt-2 text-axora-navy/70">
          Platform shell — pages are scaffolded and ready to build out.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/onboarding"
          className="rounded-md bg-axora-blue px-4 py-2 text-sm font-medium text-white hover:bg-axora-navy"
        >
          Contractor Onboarding
        </Link>
        <Link
          href="/auth/login"
          className="rounded-md border border-axora-slate px-4 py-2 text-sm font-medium text-axora-navy hover:bg-axora-slate/40"
        >
          Portal Login
        </Link>
      </div>
    </main>
  );
}
