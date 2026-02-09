import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProductAction } from "@/app/admin/products/actions";
import { requireAdminSession } from "@/lib/guards";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";

export default async function ProductsAdminPage() {
  await requireAdminSession();
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Products</p>
          <h2 className="text-lg font-semibold text-white">Manage catalog</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/categories"
            className="rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm text-white/70">
          <thead className="bg-white/[0.05]">
            <tr className="text-left text-xs uppercase tracking-[0.3em] text-white/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-white">{product.name}</td>
                <td className="px-4 py-3 text-xs">{product.category}</td>
                <td className="px-4 py-3 text-xs">
                  {product.featured ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 whitespace-nowrap">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs font-semibold text-brand-yellow"
                    >
                      Edit
                    </Link>
                    <ConfirmActionForm
                      action={deleteProductAction.bind(null, product.id)}
                      confirmText={`Delete ${product.name}? This cannot be undone.`}
                      confirmTitle="Delete product"
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
