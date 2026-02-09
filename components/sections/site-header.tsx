import Link from "next/link";
import { getSiteSettings } from "@/lib/site";
import { MobileMenu } from "@/components/sections/mobile-menu";
import { SiteNav } from "@/components/sections/site-nav";

export async function SiteHeader() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-2xl pr-2 transition hover:bg-white/[0.03]">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/LOGO1.png" alt={`${settings.businessName} logo`} className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">G7</p>
            <p className="font-display text-[1.1rem] font-semibold text-white">
              {settings.taglineMain}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
              {settings.subtitle}
            </p>
          </div>
        </Link>
        <SiteNav />
        <div className="hidden md:block">
          <Link
            href="/contact"
            data-track="cta_request_quote"
            data-track-label="header_request_quote"
            className="inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
          >
            Request a Quote
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
