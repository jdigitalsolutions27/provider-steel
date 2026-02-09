import { requireAdminSession } from "@/lib/guards";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";
import { ProductCategoryManager } from "@/components/admin/product-category-manager";
import { ProductCategoryValues } from "@/lib/enums";

export default async function ProductCategoriesPage() {
  await requireAdminSession();
  const settings = await getSiteSettings();
  const categories = parseJsonArray(settings.productCategories);
  const defaults = ProductCategoryValues;
  const initial = Array.from(new Set([...defaults, ...categories]));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Products</p>
        <h2 className="text-lg font-semibold text-white">Manage Categories</h2>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
        <ProductCategoryManager initial={initial} defaults={defaults} />
      </div>
    </div>
  );
}
