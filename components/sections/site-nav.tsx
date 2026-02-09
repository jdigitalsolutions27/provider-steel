"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-2 text-sm font-semibold text-white/70 md:flex">
      {navLinks.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-4 py-2 transition duration-200 ${
              isActive
                ? "bg-white/[0.09] text-white"
                : "text-white/72 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {link.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-yellow" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
