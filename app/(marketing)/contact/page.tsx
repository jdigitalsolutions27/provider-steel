import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { ContactForm } from "@/components/sections/contact-form";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact | G7 Provider Steel Works",
  description: "Request a quote for colored roofing, steel frames, and fabrication."
};

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ product?: string; service?: string }>;
}) {
  const query = await searchParams;
  const [settings, products, services] = await Promise.all([
    getSiteSettings(),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    }),
    prisma.service.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    })
  ]);

  const serviceAreas = parseJsonArray(settings.serviceAreas);

  return (
    <div className="page-shell">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <ContactForm
          products={products}
          services={services}
          defaultProductSlug={query.product}
          defaultServiceSlug={query.service}
        />
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-white">Contact Details</h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>{settings.address}</p>
              <p>{settings.phone}</p>
              <p>{settings.email}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-white">Service Areas</h2>
            <p className="mt-2 text-sm text-white/70">
              {serviceAreas.length
                ? serviceAreas.join(", ")
                : "Metro Manila, Calabarzon, Central Luzon"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-sm text-white/70 shadow-card">
            Map placeholder - embed a map or location image here.
          </div>
        </div>
      </div>
    </div>
  );
}
