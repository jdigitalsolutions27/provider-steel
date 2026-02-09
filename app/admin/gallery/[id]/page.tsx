import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryForm } from "@/components/admin/gallery-form";
import { updateGalleryAction } from "@/app/admin/gallery/actions";
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

function stringifyTags(tags: unknown) {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.join(", ");
  if (typeof tags === "string") return tags;
  return "";
}

function extractCategory(tags: unknown) {
  const tagString = stringifyTags(tags);
  const match = tagString
    .split(",")
    .map((item) => item.trim())
    .find((item) => item.startsWith("Category:"));
  return match ? match.replace("Category:", "") : "";
}

export default async function EditGalleryItemPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdminSession();
  const item = await prisma.galleryItem.findUnique({
    where: { id: params.id }
  });
  if (!item) notFound();
  if (item.deletedAt) notFound();
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gallery</p>
        <h2 className="text-lg font-semibold text-white">Edit Gallery Item</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <GalleryForm
          action={updateGalleryAction.bind(null, item.id)}
          initial={{
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            tags: stringifyTags(item.tags),
            category: extractCategory(item.tags),
            featured: item.featured
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
