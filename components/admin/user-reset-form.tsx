"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { resetUserPasswordAction } from "@/app/admin/users/actions";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: { ok: boolean; message?: string } = { ok: false };

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-xs text-white/70 transition duration-200 hover:border-white/40 hover:text-white disabled:opacity-60"
    >
      {pending ? "Resetting..." : "Reset Password"}
    </button>
  );
}

export function UserResetForm({ userId }: { userId: string }) {
  const [state, formAction] = useFormState(
    resetUserPasswordAction.bind(null, userId),
    initialState
  );
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.push({ title: "Password updated", variant: "success" });
      formRef.current?.reset();
    }
    if (state.message) {
      toast.push({ title: "Error", description: state.message, variant: "error" });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap gap-3">
      <PasswordInput
        name="password"
        placeholder="New password"
        required
        minLength={8}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white shadow-none focus:ring-0"
      />
      <ResetButton />
    </form>
  );
}
