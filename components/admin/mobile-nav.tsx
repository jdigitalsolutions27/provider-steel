"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems, isPathActive } from "@/components/admin/nav-items";

export function MobileAdminNav({
  role,
  newLeadsCount
}: {
  role?: string;
  newLeadsCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        className="rounded-full border border-white/20 p-2 text-white transition hover:border-white/40"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle admin menu"
        aria-expanded={open}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-black/60"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-4 right-4 top-20 max-h-[78vh] overflow-auto rounded-2xl border border-white/10 bg-brand-navy/95 p-4 shadow-soft backdrop-blur transition duration-200 ${
            open ? "translate-y-0 scale-100" : "-translate-y-2 scale-95"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/LOGO1.png" alt="G7 Provider Steel logo" className="h-full w-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Admin</p>
                <p className="text-sm font-semibold text-white">Provider Steel</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {navItems.map((item) => {
              if (item.adminOnly && role !== "ADMIN") return null;
              const Icon = item.icon;
              const active = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-white/80 transition duration-200 hover:border-white/30 hover:bg-white/5 hover:text-white ${
                    active ? "border-brand-yellow/40 bg-white/10 text-white" : "border-white/10"
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
          </div>
        </div>
      </div>
    </div>
  );
}
