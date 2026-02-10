import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { parseJsonArray } from "@/lib/utils";
import { updateTestimonialAction } from "@/app/admin/testimonials/actions";
import { TestimonialForm } from "@/components/admin/testimonial-form";

function toDateInput(value?: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditTestimonialPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession();

  const project = await prisma.testimonialProject.findUnique({
    where: { id }
  });
  if (!project || project.deletedAt) {
    redirect("/admin/testimonials");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Testimonials</p>
        <h2 className="text-lg font-semibold text-white">Edit Project</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <TestimonialForm
          action={updateTestimonialAction.bind(null, project.id)}
          initial={{
            title: project.title,
            slug: project.slug,
            details: project.details,
            status: project.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
            statusNote: project.statusNote || "",
            featured: project.featured,
            imageUrl: project.imageUrl,
            imageUrls: parseJsonArray(project.images)
              .filter((item) => item !== project.imageUrl)
              .join(", "),
            location: project.location || "",
            completedAt: toDateInput(project.completedAt),
            sortOrder: project.sortOrder
          }}
        />
      </div>
    </div>
  );
}
