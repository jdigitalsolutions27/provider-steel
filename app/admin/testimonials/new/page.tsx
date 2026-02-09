import { createTestimonialAction } from "@/app/admin/testimonials/actions";
import { requireAdminSession } from "@/lib/guards";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function NewTestimonialPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Testimonials</p>
        <h2 className="text-lg font-semibold text-white">Add Project</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <TestimonialForm action={createTestimonialAction} />
      </div>
    </div>
  );
}
