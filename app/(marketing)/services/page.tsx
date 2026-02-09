import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/sections/service-card";

export const metadata: Metadata = {
  title: "Services | G7 Provider Steel Works",
  description: "Fabrication, roll forming, delivery, and steel project support."
};

const processSteps = [
  { title: "Inquire", description: "Send specs and quantities." },
  { title: "Quote", description: "Receive detailed pricing and lead times." },
  { title: "Fabricate", description: "Production starts with QA checks." },
  { title: "Deliver", description: "Packed and delivered to site." }
];

const commonProjects = [
  "Warehouse roofing",
  "Steel frame buildings",
  "Commercial roll-up doors",
  "Canopies and awnings",
  "Industrial cladding"
];

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="page-shell">
      <div className="section-head">
        <p className="section-eyebrow">Services</p>
        <h1 className="section-title font-semibold text-white">Fabrication & Support</h1>
        <p className="section-copy">
          Dedicated production and logistics for every steel requirement.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-white">Process Timeline</h2>
          <div className="mt-6 space-y-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-brand-yellow">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-white/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-white">Common Projects</h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-white/70 marker:text-brand-yellow">
            {commonProjects.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
          >
            Start a Project
          </Link>
        </div>
      </div>
    </div>
  );
}
