import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { TestimonialProjects } from "@/components/sections/testimonial-projects";
import type { ProjectItem } from "@/components/sections/testimonial-projects";

export const metadata: Metadata = {
  title: "Testimonials & Projects | G7 Provider Steel Works",
  description:
    "See completed and ongoing G7 Provider Steel Works projects with photos, scope details, and project status."
};

export default async function TestimonialsPage() {
  const projects = await prisma.testimonialProject.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  const normalized: ProjectItem[] = projects.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    details: item.details,
    status: item.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
    statusNote: item.statusNote,
    location: item.location,
    completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    images: Array.from(new Set([item.imageUrl, ...parseJsonArray(item.images)].filter(Boolean)))
  }));
  const completed = normalized.filter((item) => item.status === "COMPLETED");
  const ongoing = normalized.filter((item) => item.status === "ONGOING");

  return (
    <div className="page-shell">
      <div className="section-head">
        <p className="section-eyebrow">Testimonials</p>
        <h1 className="section-title font-semibold text-white">Finished and Ongoing Projects</h1>
        <p className="section-copy">
          Track completed builds and active projects from roofing supply to full steel fabrication.
        </p>
      </div>

      <TestimonialProjects completed={completed} ongoing={ongoing} />

      <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-10 text-center shadow-card">
        <h2 className="text-2xl font-semibold text-white">Need similar results for your project?</h2>
        <p className="mt-2 text-white/70">
          Send your requirements and get a detailed quote from G7 Provider Steel Works.
        </p>
        <Link
          href="/contact"
          data-track="cta_request_quote"
          data-track-label="testimonials_request_quote"
          className="mt-6 inline-flex rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
        >
          Request a Quote
        </Link>
      </section>
    </div>
  );
}
