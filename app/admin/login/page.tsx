"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const reason = params.get("reason");

  useEffect(() => {
    if (!reason) return;
    signOut({ redirect: false });
  }, [reason]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/LOGO1.png" alt="G7 Provider Steel logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">G7</p>
            <p className="text-lg font-semibold text-white">Provider Steel</p>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Admin Login</h1>
        <p className="mt-2 text-sm text-white/70">
          Access the G7 Provider Steel Works dashboard.
        </p>
        {reason === "reset" && (
          <p className="mt-4 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3 text-xs text-brand-yellow">
            Your password was changed. Please sign in again.
          </p>
        )}
        {reason === "deleted" && (
          <p className="mt-4 rounded-2xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-xs text-brand-red">
            Your account was deleted. Please contact an administrator.
          </p>
        )}
        {reason === "reset-success" && (
          <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-300">
            Password updated. You can now sign in.
          </p>
        )}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Email
            </label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Password
            </label>
            <PasswordInput name="password" required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && <p className="text-sm text-brand-yellow">{error}</p>}
        </form>
        <div className="mt-4 text-sm">
          <Link href="/admin/forgot-password" className="text-brand-yellow hover:text-brand-yellow/80">
            Forgot email or password?
          </Link>
        </div>
      </div>
    </div>
  );
}
