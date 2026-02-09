import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent, getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About | G7 Provider Steel Works",
  description: "Our story, mission, and service areas."
};

export default async function AboutPage() {
  const [content, settings] = await Promise.all([
    getSiteContent(),
    getSiteSettings()
  ]);

  const areas = parseJsonArray(settings.serviceAreas);

  return (
    <div className="page-shell">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-eyebrow">About</p>
          <h1 className="section-title font-semibold text-white">{settings.businessName}</h1>
          <p className="section-copy">{content.aboutIntro}</p>
          <p className="mt-4 text-white/70">{content.aboutBody}</p>
          <div className="mt-8 grid gap-5 text-sm text-white/70">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mission</p>
              <p className="mt-2">Deliver steel systems that protect, perform, and elevate every build.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Values</p>
              <p className="mt-2">Precision, speed, transparency, and reliability.</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-white">Service Areas</h2>
          <p className="mt-2 text-white/70">We deliver across the following areas:</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {areas.length ? (
              areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-white/20 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/70"
                >
                  {area}
                </span>
              ))
            ) : (
              <p className="text-sm text-white/60">Contact us for coverage details.</p>
            )}
          </div>
          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
          >
            Work With Us
          </Link>
        </div>
      </div>
    </div>
  );
}
