"use client";

import { useState } from "react";
import { FallbackImage } from "@/components/ui/fallback-image";

type UserCardProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  children?: React.ReactNode;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserCard({ user, children }: UserCardProps) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(user.name || "U");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 shadow-card">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => user.avatarUrl && setOpen(true)}
          className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5 transition hover:border-white/30"
          aria-label="View profile photo"
        >
          {user.avatarUrl ? (
            <FallbackImage
              src={user.avatarUrl}
              fallbackSrc="/placeholders/steel-1.svg"
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/80">
              {initials}
            </div>
          )}
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-white/60">{user.email}</p>
          <p className="text-xs text-white/60">{user.role}</p>
        </div>
      </div>
      <div className="mt-3">{children}</div>

      {open && user.avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-brand-navy/95 p-3 shadow-soft sm:rounded-3xl sm:p-4">
            <button
              type="button"
              className="absolute right-3 top-3 z-20 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#102338] to-[#091725] p-2 sm:p-3">
              <FallbackImage
                src={user.avatarUrl}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={user.name}
                className="mx-auto max-h-[72vh] w-full rounded-xl bg-[#071320] object-contain"
              />
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
