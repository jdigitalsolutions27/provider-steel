import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { parseJsonArray } from "@/lib/utils";
import { ProductCategoryValues } from "@/lib/enums";
import { getSiteSettings } from "@/lib/site";
import { GalleryAlbumGrid } from "@/components/admin/gallery-album-grid";
import { GalleryFeaturedManager } from "@/components/admin/gallery-featured-manager";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export default async function GalleryAdminPage() {
  await requireAdminSession();
  const settings = await getSiteSettings();
  const customCategories = parseJsonArray(settings.galleryCategories);
  const productCategories = parseJsonArray(settings.productCategories);
  const items = await prisma.galleryItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  const fallbackCategories = Object.values(categoryLabels);
  const allowedCategories = Array.from(
    new Set(
      [
        ...(customCategories.length ? customCategories : []),
        ...(productCategories.length
          ? productCategories
          : ProductCategoryValues.map((key) => categoryLabels[key] || key))
      ].map((item) => categoryLabels[item] || item)
    )
  );
  const normalizedAllowed = allowedCategories.length ? allowedCategories : fallbackCategories;

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const tags = parseJsonArray(item.tags);
    const categoryTag = tags.find((tag) => tag.startsWith("Category:"));
    if (!categoryTag) {
      acc.General = acc.General || [];
      acc.General.push(item);
      return acc;
    }
    const categoryKey = categoryTag.replace("Category:", "");
    const label = categoryLabels[categoryKey] || categoryKey;
    acc[label] = acc[label] || [];
    acc[label].push(item);
    return acc;
  }, {});

  const dynamicCategories = Object.keys(grouped).filter(
    (label) => label !== "General" && !normalizedAllowed.includes(label)
  );
  const categoryOrder = [...normalizedAllowed, ...dynamicCategories, "General"];
  const albums = categoryOrder
    .filter((label) => grouped[label]?.length)
    .map((label) => ({
      label,
      items: grouped[label].map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        featured: item.featured
      }))
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gallery</p>
          <h2 className="text-lg font-semibold text-white">Manage gallery</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/gallery/categories"
            className="rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/gallery/new"
            className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
          >
            Add Item
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <GalleryFeaturedManager
          items={items.map((item) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            featured: item.featured,
            tags: item.tags
          }))}
        />

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Albums</h3>
            <p className="text-xs text-white/50">
              Click an album to view photos
            </p>
          </div>
          {albums.length === 0 ? (
            <p className="text-sm text-white/60">No albums yet.</p>
          ) : (
            <GalleryAlbumGrid albums={albums} />
          )}
        </div>
      </div>
    </div>
  );
}
