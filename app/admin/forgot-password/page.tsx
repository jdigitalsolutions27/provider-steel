"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetAction,
  type ForgotPasswordState
} from "@/app/admin/forgot-password/actions";

const initialState: ForgotPasswordState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-60"
    >
      {pending ? "Sending link..." : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordResetAction, initialState);

  useEffect(() => {
    // keep page stable after success; no redirect needed
  }, [state.ok]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter your admin email and we will send a secure reset link.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email</label>
            <Input name="email" type="email" required />
          </div>
          <SubmitButton />
        </form>

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
          <Link href="/admin/login" className="text-brand-yellow hover:text-brand-yellow/80">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
