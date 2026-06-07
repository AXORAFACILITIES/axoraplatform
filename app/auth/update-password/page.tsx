"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(
          "Could not update your password. Your reset link may have expired — please request a new one.",
        );
        setSubmitting(false);
        return;
      }
      router.push("/auth/login?reset=success");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-sm rounded-lg border border-axora-slate bg-white p-8 shadow-sm">
        <Link href="/" className="text-lg font-bold text-axora-navy">
          Axora Facilities
        </Link>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <h1 className="text-lg font-semibold text-axora-navy">
              Set a new password
            </h1>
            <p className="mt-1 text-sm text-axora-navy/60">
              Choose a password with at least 8 characters.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-axora-navy/80">
              New password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wide text-axora-navy/80">
              Confirm password
            </label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" variant="secondary" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
