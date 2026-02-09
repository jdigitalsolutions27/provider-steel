"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white"
    >
      Sign out
    </button>
  );
}
