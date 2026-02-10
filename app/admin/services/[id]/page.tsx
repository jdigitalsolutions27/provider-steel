import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";
import { updateServiceAction } from "@/app/admin/services/actions";
import { requireAdminSession } from "@/lib/guards";

export default async function EditServicePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    redirect("/admin/services");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Services</p>
        <h2 className="text-lg font-semibold text-white">Edit Service</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <ServiceForm
          action={updateServiceAction.bind(null, service.id)}
          initial={{
            name: service.name,
            slug: service.slug,
            description: service.description,
            featured: service.featured,
            iconName: service.iconName
          }}
        />
      </div>
    </div>
  );
}
