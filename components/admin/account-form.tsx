"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { PasswordInput } from "@/components/ui/password-input";
import { changePasswordAction, updateProfileAction } from "@/app/admin/account/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AccountForm({
  initialName,
  initialEmail,
  initialAvatarUrl
}: {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl?: string | null;
}) {
  const [profileState, profileAction] = useFormState(updateProfileAction, initialState);
  const [passwordState, passwordAction] = useFormState(changePasswordAction, initialState);
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [removeConfirmed, setRemoveConfirmed] = useState(false);

  useEffect(() => {
    if (profileState.ok) toast.push({ title: "Name updated", variant: "success" });
    if (profileState.message)
      toast.push({ title: "Error", description: profileState.message, variant: "error" });
  }, [profileState, toast]);

  useEffect(() => {
    if (passwordState.ok) {
      toast.push({ title: "Password updated", variant: "success" });
      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    }
    if (passwordState.message)
      toast.push({ title: "Error", description: passwordState.message, variant: "error" });
  }, [passwordState, toast]);

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        action={profileAction}
        className="space-y-4"
        encType="multipart/form-data"
        onSubmit={(event) => {
          const remove = (event.currentTarget.elements.namedItem("removeAvatar") as
            | HTMLInputElement
            | null)?.checked;
          if (remove && !removeConfirmed) {
            event.preventDefault();
            setConfirmRemoveOpen(true);
            return;
          }
          setRemoveConfirmed(false);
        }}
      >
        <div className="flex items-center gap-4">
          {initialAvatarUrl ? (
            <img
              src={initialAvatarUrl}
              alt="Profile"
              className="h-14 w-14 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/80">
              {getInitials(initialName || "U")}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Profile Photo
            </label>
            <input
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-xs text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            />
            {initialAvatarUrl && (
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  name="removeAvatar"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
                Remove current photo
              </label>
            )}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Display Name</label>
          <input
            name="name"
            defaultValue={initialName}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
          <p className="mt-1 text-xs text-white/50">Example: Staff_Jay</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={initialEmail}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
          <p className="mt-1 text-xs text-white/50">
            Used for login and notifications.
          </p>
        </div>
        <SubmitButton label="Update Profile" />
      </form>
      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remove profile photo"
        description="Are you sure you want to remove the current profile photo?"
        confirmLabel="Remove photo"
        cancelLabel="Cancel"
        onCancel={() => setConfirmRemoveOpen(false)}
        onConfirm={() => {
          setConfirmRemoveOpen(false);
          setRemoveConfirmed(true);
          formRef.current?.requestSubmit();
        }}
      />

      <form action={passwordAction} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">
            Current Password
          </label>
          <PasswordInput name="currentPassword" required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">
            New Password
          </label>
          <PasswordInput name="newPassword" required />
        </div>
        <SubmitButton label="Change Password" />
      </form>
    </div>
  );
}

