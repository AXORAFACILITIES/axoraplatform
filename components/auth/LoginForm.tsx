"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const resetOk = params.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("Incorrect email or password. Please try again.");
        setSubmitting(false);
        return;
      }
      // Server callback reads the session + role and routes to the portal.
      const dest = redirect
        ? `/auth/callback?redirect=${encodeURIComponent(redirect)}`
        : "/auth/callback";
      window.location.assign(dest);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-axora-navy">
          Sign in to your portal
        </h1>
        <p className="mt-1 text-sm text-axora-navy/60">
          Welcome back. Enter your credentials to continue.
        </p>
      </div>

      {resetOk ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Password updated. Please sign in.
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-axora-navy/80">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-axora-navy/80">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-axora-navy/50 hover:text-axora-navy"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        variant="secondary"
        disabled={submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <Spinner className="h-4 w-4 text-white" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-axora-blue hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
