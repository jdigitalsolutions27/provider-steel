"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import {
  resetPasswordAction,
  type ResetPasswordState
} from "@/app/admin/reset-password/actions";

const initialState: ResetPasswordState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-60"
    >
      {pending ? "Updating password..." : "Set new password"}
    </button>
  );
}

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  useEffect(() => {
    if (!state.ok) return;
    const timeout = window.setTimeout(() => {
      window.location.href = "/admin/login?reason=reset-success";
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [state.ok]);

  const invalidLink = !token || !email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-white/70">Create a new password for your admin account.</p>

        {invalidLink ? (
          <div className="mt-6 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3 text-xs text-brand-yellow">
            Invalid reset link. Please request a new password reset.
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />

            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email</label>
              <Input value={email} disabled />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">New password</label>
              <PasswordInput name="password" required />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">Confirm password</label>
              <PasswordInput name="confirmPassword" required />
            </div>
            <SubmitButton />
          </form>
        )}

        {state.message && (
          <p
            className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
              state.ok
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="mt-5 text-sm">
          <Link href="/admin/forgot-password" className="text-brand-yellow hover:text-brand-yellow/80">
            Request new reset link
          </Link>
        </div>
      </div>
    </div>
  );
}
