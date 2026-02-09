import { GalleryForm } from "@/components/admin/gallery-form";
import { createGalleryAction } from "@/app/admin/gallery/actions";
import { requireAdminSession } from "@/lib/guards";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";
import { ProductCategoryValues } from "@/lib/enums";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export default async function NewGalleryItemPage({
  searchParams
}: {
  searchParams?: { category?: string };
}) {
  await requireAdminSession();
  const settings = await getSiteSettings();
  const customCategories = parseJsonArray(settings.galleryCategories);
  const productCategories = parseJsonArray(settings.productCategories);
  const categories = Array.from(
    new Set([
      ...(productCategories.length
        ? productCategories
        : ProductCategoryValues.map((key) => categoryLabels[key] || key)),
      ...customCategories
    ].map((item) => categoryLabels[item] || item))
  );
  const selectedCategory = searchParams?.category || "";
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gallery</p>
        <h2 className="text-lg font-semibold text-white">Add Gallery Item</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <GalleryForm
          action={createGalleryAction}
          categories={categories}
          initial={selectedCategory ? { category: selectedCategory } : undefined}
        />
      </div>
    </div>
  );
}
