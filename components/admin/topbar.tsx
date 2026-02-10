"use client";

import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/signout-button";
import { MobileAdminNav } from "@/components/admin/mobile-nav";
import { getAdminPageLabel } from "@/components/admin/nav-items";
import { FallbackImage } from "@/components/ui/fallback-image";

export function Topbar({
  user,
  role,
  newLeadsCount
}: {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  };
  role?: string | null;
  newLeadsCount: number;
}) {
  const pathname = usePathname() || "";
  const pageLabel = getAdminPageLabel(pathname);
  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="relative flex items-center justify-between border-b border-white/10 bg-brand-navy/95 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileAdminNav role={role ?? undefined} newLeadsCount={newLeadsCount} />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dashboard</p>
          <h1 className="text-lg font-semibold text-white">{pageLabel}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
          {user.avatarUrl ? (
            <FallbackImage
              src={user.avatarUrl}
              fallbackSrc="/placeholders/steel-1.svg"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/80">
              {initials}
            </div>
          )}
        </div>
        <div className="hidden text-right text-xs text-white/70 md:block">
          <p className="font-semibold text-white">{user.name}</p>
          <p>{user.email}</p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
