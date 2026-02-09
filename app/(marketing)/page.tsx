import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteContent, getSiteSettings } from "@/lib/site";
import { ProductCard } from "@/components/sections/product-card";
import { ServiceCard } from "@/components/sections/service-card";
import { WhyUsCard } from "@/components/sections/why-us-card";
import { GalleryCard } from "@/components/sections/gallery-card";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { HeroLogoLive } from "@/components/sections/hero-logo-live";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "G7 Provider Steel Works | Colored Roofing & Steel Frames",
  description:
    "Industrial-grade colored roofing, steel frames, roll-up doors, and fabrication services with fast quotations and delivery."
};

export default async function HomePage() {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getSiteContent()
  ]);

  let featuredProducts = await prisma.product.findMany({
    where: { featured: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  if (featuredProducts.length === 0) {
    const fallback = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    featuredProducts = fallback;
  }

  const galleryItems = await prisma.galleryItem.findMany({
    where: { featured: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  const [featuredServices, whyUsItems, featuredTestimonials, faqItems] = await Promise.all([
    prisma.service.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 4
    }),
    prisma.whyUsItem.findMany({ orderBy: { order: "asc" }, take: 6 }),
    prisma.testimonialProject.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 4
    }),
    prisma.fAQItem.findMany({ orderBy: { order: "asc" }, take: 6 })
  ]);

  const serviceAreas = parseJsonArray(settings.serviceAreas);

  return (
    <div>
      <section className="relative overflow-hidden bg-steel-radial">
        <div className="absolute inset-0 bg-steel-grid opacity-30" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(243,179,22,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            animation: "heroDrift 16s linear infinite"
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 10px)",
            animation: "heroDriftReverse 22s linear infinite"
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.6em] text-white/60">
              {settings.logoTextSmall}
            </p>
            <h1 className="text-5xl font-bold uppercase text-white md:text-6xl">
              {settings.taglineMain}
            </h1>
            <p className="text-2xl font-semibold text-white/70">{settings.subtitle}</p>
            <p className="text-base font-semibold text-white/70">{settings.businessName}</p>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-yellow">
              {settings.serviceLine}
            </p>
            <p className="text-lg text-white/70">
              Roofing, roll-up doors, purlins, bending, coils, galvanized zinc, and
              fabrication with rapid quotations and delivery support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                data-track="cta_request_quote"
                data-track-label="hero_request_quote"
                className="rounded-full bg-brand-red px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-600"
              >
                Request a Quote
              </Link>
              <Link
                href={`tel:${settings.phone}`}
                data-track="cta_call_now"
                data-track-label="hero_call_now"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                Call Now
              </Link>
              <Link
                href="/products"
                data-track="cta_browse_products"
                data-track-label="hero_browse_products"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="relative flex min-h-[360px] items-center justify-center">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-red/30 blur-3xl" />
            <div className="absolute bottom-6 left-6 h-28 w-28 rounded-full bg-brand-yellow/30 blur-3xl" />
            <HeroLogoLive src="/LOGO1.png" alt="G7 Provider Steel Works" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-brand-steel/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-6 text-sm font-semibold text-white/70">
          <span>Fast Quotation</span>
          <span>&bull;</span>
          <span>Quality Materials</span>
          <span>&bull;</span>
          <span>Custom Fabrication</span>
          <span>&bull;</span>
          <span>Delivery Available</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Featured</p>
            <h2 className="text-3xl font-semibold text-white">Top Products</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-brand-yellow">
            View all products
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-steel/30">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.14]" />
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-brand-red/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Services</p>
              <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
                Fabrication & Support
              </h2>
              <p className="mt-3 text-sm text-white/70 md:text-base">
                End-to-end steel work support from roll forming to site delivery.
              </p>
            </div>
            <Link
              href="/services"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              View All Services
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Why Choose Us</p>
          <h2 className="text-3xl font-semibold text-white">Built for Performance</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {whyUsItems.map((item) => (
            <WhyUsCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="bg-brand-steel/30">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Gallery</p>
              <h2 className="text-3xl font-semibold text-white">Recent Projects</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Latest fabrication snapshots, roof profiles, and field installation progress from active and finished projects.
              </p>
            </div>
            <Link
              href="/gallery"
              data-track="cta_view_gallery"
              data-track-label="home_recent_projects_view_gallery"
              className="text-sm font-semibold text-brand-yellow"
            >
              View gallery
            </Link>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/75">
              Roofing, Steel Frames, Installation
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/75">
              Real project captures
            </span>
          </div>
          {galleryItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-sm text-white/70">
              No featured gallery images selected yet. Admin can feature images in the Gallery dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item, index) => (
                <GalleryCard key={item.id} item={item} featured={index === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Testimonials</p>
            <h2 className="text-3xl font-semibold text-white">Featured Project Stories</h2>
          </div>
          <Link href="/testimonials" className="text-sm font-semibold text-brand-yellow">
            View all projects
          </Link>
        </div>
        {featuredTestimonials.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-white/70">
            No featured project stories yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTestimonials.map((project) => {
              const images = Array.from(
                new Set([project.imageUrl, ...parseJsonArray(project.images)].filter(Boolean))
              );
              return (
                <Link
                  key={project.id}
                  href={`/testimonials?project=${encodeURIComponent(project.slug)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-card transition duration-200 hover:-translate-y-1 hover:border-white/30"
                >
                  <div className="relative h-40 overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[0]}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm ${
                        project.status === "COMPLETED"
                          ? "border-emerald-300/60 bg-[#0f2b23]/90 text-emerald-100"
                          : "border-amber-300/60 bg-[#2b210a]/90 text-amber-100"
                      }`}
                    >
                      {project.status === "COMPLETED" ? "Completed" : "Ongoing"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col space-y-2 p-4">
                    <h3 className="line-clamp-1 text-[1.35rem] font-semibold leading-tight text-white">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/70">{project.details}</p>
                    {(project.location || project.statusNote) && (
                      <p className="line-clamp-1 text-xs text-white/55">
                        {[project.location, project.statusNote].filter(Boolean).join(" | ")}
                      </p>
                    )}
                    <p className="mt-auto pt-1 text-xs font-semibold text-brand-yellow">Open preview</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">FAQ</p>
          <h2 className="text-3xl font-semibold text-white">Common Questions</h2>
        </div>
        <FAQAccordion items={faqItems} />
      </section>

      <section className="bg-gradient-to-r from-brand-red/20 via-brand-navy to-brand-yellow/20">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-24 text-center">
          <h2 className="text-3xl font-semibold text-white">Ready to start your project?</h2>
          <p className="mt-3 text-white/70">
            Share your specs and we will return a detailed quotation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              data-track="cta_request_quote"
              data-track-label="cta_band_request_quote"
              className="rounded-full bg-brand-yellow px-6 py-3 text-sm font-semibold text-brand-navy"
            >
              {content.ctaPrimaryText}
            </Link>
            <Link
              href={`tel:${settings.phone}`}
              data-track="cta_call_now"
              data-track-label="cta_band_call_now"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              {content.ctaSecondaryText}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-card">
          <h3 className="text-2xl font-semibold text-white">Contact & Service Areas</h3>
          <p className="mt-3 text-sm text-white/70">
            {settings.address}
          </p>
          <div className="mt-6 grid gap-4 text-sm text-white/70">
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Service Areas</p>
              <p className="mt-2 text-white/70">
                {serviceAreas.length ? serviceAreas.join(", ") : "Metro Manila, Calabarzon, Central Luzon"}
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative flex h-full flex-col items-center justify-center p-10 text-center text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em]">Map Placeholder</p>
            <p className="mt-2">Replace with embedded map or location image.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
