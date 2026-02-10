import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { deleteTestimonialAction } from "@/app/admin/testimonials/actions";
import { formatDate } from "@/lib/utils";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";
import { TestimonialSaveNotice } from "@/components/admin/testimonial-save-notice";
import { FallbackImage } from "@/components/ui/fallback-image";

const statusStyles: Record<string, string> = {
  COMPLETED: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  ONGOING: "border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow"
};

const featuredStyle = "border-brand-red/40 bg-brand-red/10 text-brand-red";

export default async function TestimonialsAdminPage() {
  await requireAdminSession();

  const projects = await prisma.testimonialProject.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  const ongoingProjects = projects.filter((project) => project.status === "ONGOING");
  const completedProjects = projects.filter((project) => project.status === "COMPLETED");

  const renderTable = (items: typeof projects) => {
    if (items.length === 0) {
      return (
        <p className="px-4 py-6 text-sm text-white/60">No projects in this section yet.</p>
      );
    }

    return (
      <>
        <div className="space-y-3 p-3 md:hidden">
          {items.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-start gap-3">
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  <FallbackImage
                    src={project.imageUrl}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-white">{project.title}</p>
                  <p className="mt-0.5 text-xs text-white/50">{project.slug}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.15em] ${
                        statusStyles[project.status] || "border-white/20 text-white/70"
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.featured ? (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${featuredStyle}`}
                      >
                        Featured
                      </span>
                    ) : null}
                    <span>Order {project.sortOrder}</span>
                    {project.completedAt ? <span>{formatDate(project.completedAt)}</span> : null}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <Link
                  href={`/testimonials?project=${encodeURIComponent(project.slug)}`}
                  className="font-semibold text-white/80 transition hover:text-white"
                >
                  View
                </Link>
                <Link
                  href={`/admin/testimonials/${project.id}`}
                  className="font-semibold text-brand-yellow"
                >
                  Edit
                </Link>
                <ConfirmActionForm
                  action={deleteTestimonialAction.bind(null, project.id)}
                  confirmTitle="Move to recycle bin"
                  confirmLabel="Move"
                  confirmText={`Move ${project.title} to recycle bin?`}
                >
                  <button className="text-white/60" type="submit">
                    Delete
                  </button>
                </ConfirmActionForm>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-sm text-white/70">
            <thead className="bg-white/[0.05]">
              <tr className="text-left text-xs uppercase tracking-[0.3em] text-white/50">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((project) => (
                <tr key={project.id} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-14 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <FallbackImage
                          src={project.imageUrl}
                          fallbackSrc="/placeholders/steel-1.svg"
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{project.title}</p>
                        <p className="text-xs text-white/50">{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        statusStyles[project.status] || "border-white/20 text-white/70"
                      }`}
                    >
                      {project.status}
                    </span>
                    {project.featured ? (
                      <span
                        className={`ml-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${featuredStyle}`}
                      >
                        Featured
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs">{project.sortOrder}</td>
                  <td className="px-4 py-3 text-xs">
                    {project.completedAt ? formatDate(project.completedAt) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 whitespace-nowrap">
                      <Link
                        href={`/testimonials?project=${encodeURIComponent(project.slug)}`}
                        className="text-xs font-semibold text-white/80 transition hover:text-white"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/testimonials/${project.id}`}
                        className="text-xs font-semibold text-brand-yellow"
                      >
                        Edit
                      </Link>
                      <ConfirmActionForm
                        action={deleteTestimonialAction.bind(null, project.id)}
                        confirmTitle="Move to recycle bin"
                        confirmLabel="Move"
                        confirmText={`Move ${project.title} to recycle bin?`}
                      >
                        <button className="text-xs text-white/60" type="submit">
                          Delete
                        </button>
                      </ConfirmActionForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <TestimonialSaveNotice />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Testimonials</p>
          <h2 className="text-lg font-semibold text-white">Project Showcase</h2>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
        >
          Add Project
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-card">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">Ongoing</h3>
        </div>
        {renderTable(ongoingProjects)}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-card">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Completed</h3>
        </div>
        {renderTable(completedProjects)}
      </div>
    </div>
  );
}
