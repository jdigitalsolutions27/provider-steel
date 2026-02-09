import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteServiceAction } from "@/app/admin/services/actions";
import { requireAdminSession } from "@/lib/guards";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";

export default async function ServicesAdminPage() {
  await requireAdminSession();
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Services</p>
          <h2 className="text-lg font-semibold text-white">Manage services</h2>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
        >
          Add Service
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm text-white/70">
          <thead className="bg-white/[0.05]">
            <tr className="text-left text-xs uppercase tracking-[0.3em] text-white/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-white">{service.name}</td>
                <td className="px-4 py-3 text-xs">
                  {service.featured ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 whitespace-nowrap">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="text-xs font-semibold text-brand-yellow"
                    >
                      Edit
                    </Link>
                    <ConfirmActionForm
                      action={deleteServiceAction.bind(null, service.id)}
                      confirmText={`Delete ${service.name}? This cannot be undone.`}
                      confirmTitle="Delete service"
                      confirmLabel="Delete"
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
      </div>
    </div>
  );
}
