"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/ui/password-input";
import { createUserAction } from "@/app/admin/users/actions";
import { UserRoleValues } from "@/lib/enums";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Create User"}
    </button>
  );
}

export function UserForm() {
  const [state, formAction] = useFormState(createUserAction, initialState);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) {
      toast.push({ title: "User created", variant: "success" });
      window.location.reload();
    }
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Name</label>
          <input name="name" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email</label>
          <input name="email" type="email" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" required />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Role</label>
          <select name="role" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30">
            {UserRoleValues.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Password</label>
          <PasswordInput name="password" minLength={8} required />
          <p className="mt-1 text-xs text-white/50">At least 8 characters.</p>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

