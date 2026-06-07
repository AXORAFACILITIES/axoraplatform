import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-axora-navy p-12 text-white lg:flex">
        <Link href="/" className="relative z-10">
          <span className="block text-4xl font-extrabold tracking-tight">
            AXORA
          </span>
          <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.35em] text-axora-sky">
            Facilities
          </span>
        </Link>
        <p className="relative z-10 max-w-xs text-lg font-medium text-white/90">
          Professional property maintenance — Metro Atlanta.
        </p>
        {/* Geometric brand mark */}
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="absolute -bottom-10 -right-10 h-80 w-80 text-axora-blue/30"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        >
          <path d="M40 40 L120 120 M120 60 L60 130" />
          <path d="M150 30 L185 65 L150 100" strokeWidth="10" />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-[var(--background)] p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 block text-lg font-bold text-axora-navy lg:hidden"
          >
            Axora Facilities
          </Link>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
