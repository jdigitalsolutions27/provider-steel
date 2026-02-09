"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, isPathActive } from "@/components/admin/nav-items";

export function Sidebar({
  role,
  newLeadsCount
}: {
  role?: string;
  newLeadsCount: number;
}) {
  const pathname = usePathname() || "";
  return (
    <aside className="flex h-full w-full flex-col border-r border-white/10 bg-brand-navy/95 p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/LOGO1.png" alt="G7 Provider Steel logo" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">G7</p>
          <p className="font-display text-xl text-white">Provider Steel</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map((item) => {
          if (item.adminOnly && role !== "ADMIN") return null;
          const Icon = item.icon;
          const active = isPathActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-white/70 transition duration-200 hover:border-white/10 hover:bg-white/5 hover:text-white ${
                active
                  ? "border-brand-yellow/40 bg-white/10 text-white shadow-soft"
                  : "border-transparent"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={16} className={active ? "text-brand-yellow" : undefined} />
                {item.label}
              </span>
              {item.key === "leads" && newLeadsCount > 0 && (
                <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-semibold text-white">
                  {newLeadsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
