"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        className="rounded-full border border-white/20 bg-white/[0.03] p-2 text-white transition hover:border-white/40"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <div
        className={`fixed inset-0 z-50 transition duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/65"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-4 right-4 top-20 rounded-2xl border border-white/10 bg-brand-navy/95 p-5 shadow-soft backdrop-blur-xl transition duration-200 ${
            open ? "translate-y-0 scale-100" : "-translate-y-2 scale-95"
          }`}
        >
          <div className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-brand-yellow/45 bg-white/[0.09] text-white"
                      : "border-white/10 text-white/80 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              data-track="cta_request_quote"
              data-track-label="mobile_menu_request_quote"
              className="mt-1 rounded-full bg-brand-red px-4 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
