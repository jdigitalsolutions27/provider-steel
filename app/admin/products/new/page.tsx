import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/app/admin/products/actions";
import { requireAdminSession } from "@/lib/guards";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";

export default async function NewProductPage() {
  await requireAdminSession();
  const settings = await getSiteSettings();
  const categories = parseJsonArray(settings.productCategories);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Products</p>
        <h2 className="text-lg font-semibold text-white">Add New Product</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <ProductForm action={createProductAction} categories={categories} />
      </div>
    </div>
  );
}
