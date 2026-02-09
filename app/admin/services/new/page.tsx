import { ServiceForm } from "@/components/admin/service-form";
import { createServiceAction } from "@/app/admin/services/actions";
import { requireAdminSession } from "@/lib/guards";

export default async function NewServicePage() {
  await requireAdminSession();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Services</p>
        <h2 className="text-lg font-semibold text-white">Add New Service</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <ServiceForm action={createServiceAction} />
      </div>
    </div>
  );
}
