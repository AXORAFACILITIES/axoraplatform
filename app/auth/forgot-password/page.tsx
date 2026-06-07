"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
    } catch {
      /* show the same neutral message regardless */
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-sm rounded-lg border border-axora-slate bg-white p-8 shadow-sm">
        <Link href="/" className="text-lg font-bold text-axora-navy">
          Axora Facilities
        </Link>
        {sent ? (
          <div className="mt-6">
            <h1 className="text-lg font-semibold text-axora-navy">Check your email</h1>
            <p className="mt-2 text-sm text-axora-navy/70">
              If an account exists with that email, you&apos;ll receive a reset
              link shortly.
            </p>
            <Link
              href="/auth/login"
              className="mt-4 inline-block text-sm text-axora-blue hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <h1 className="text-lg font-semibold text-axora-navy">
                Reset your password
              </h1>
              <p className="mt-1 text-sm text-axora-navy/60">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-axora-navy/80">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 text-white" /> Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-axora-blue hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
