import Link from "next/link";
import { getSiteSettings } from "@/lib/site";

const productLinks = [
  { href: "/products?category=ROOFING", label: "Colored Roofing" },
  { href: "/products?category=ROLLUP_DOORS", label: "Roll-Up Doors" },
  { href: "/products?category=CEE_PURLINS", label: "Cee Purlins" },
  { href: "/products?category=ACCESSORIES", label: "Accessories" },
  { href: "/products?category=COILS_ZINC", label: "Coils & Zinc" }
];

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Request Quote" }
];

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-white/10 bg-brand-navy/95">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.15fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/LOGO1.png" alt={`${settings.businessName} logo`} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-display text-xl text-white">{settings.taglineMain}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{settings.subtitle}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">{settings.serviceLine}</p>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <p>{settings.address}</p>
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Products
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Quick Links
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            {settings.messengerUrl && (
              <Link
                href={settings.messengerUrl}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white"
              >
                Messenger
              </Link>
            )}
            {settings.whatsappUrl && (
              <Link
                href={settings.whatsappUrl}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white"
              >
                WhatsApp
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
