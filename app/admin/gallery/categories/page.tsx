import { requireAdminSession } from "@/lib/guards";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";
import { GalleryCategoryManager } from "@/components/admin/gallery-category-manager";
import { ProductCategoryValues } from "@/lib/enums";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export default async function GalleryCategoriesPage() {
  await requireAdminSession();
  const settings = await getSiteSettings();
  const categories = parseJsonArray(settings.galleryCategories);
  const productCategories = parseJsonArray(settings.productCategories);
  const defaultCategories = ProductCategoryValues.map((key) => categoryLabels[key] || key);
  const initialCategories = Array.from(
    new Set([
      ...(productCategories.length ? productCategories : defaultCategories),
      ...categories
    ].map((item) => categoryLabels[item] || item))
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gallery</p>
        <h2 className="text-lg font-semibold text-white">Manage Categories</h2>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
        <GalleryCategoryManager initial={initialCategories} />
      </div>
    </div>
  );
}
