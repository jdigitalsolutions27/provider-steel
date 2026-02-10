import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GalleryAlbumGrid } from "@/components/sections/gallery-album-grid";
import { parseJsonArray } from "@/lib/utils";
import { ProductCategoryValues } from "@/lib/enums";
import { getSiteSettings } from "@/lib/site";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export const metadata: Metadata = {
  title: "Gallery | G7 Provider Steel Works",
  description: "Recent roofing, fabrication, and steel project highlights."
};

export default async function GalleryPage({
  searchParams
}: {
  searchParams?: Promise<{ album?: string | string[] }>;
}) {
  const query = searchParams ? await searchParams : undefined;
  const requestedAlbum =
    typeof query?.album === "string"
      ? query.album
      : Array.isArray(query?.album)
      ? query?.album[0]
      : "";

  const settings = await getSiteSettings();
  const customCategories = parseJsonArray(settings.galleryCategories);
  const productCategories = parseJsonArray(settings.productCategories);
  const items = await prisma.galleryItem.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
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
      items: grouped[label]
    }));

  return (
    <div className="page-shell">
      <div className="section-head">
        <p className="section-eyebrow">Gallery</p>
        <h1 className="section-title font-semibold text-white">Project Highlights</h1>
        <p className="section-copy">
          A snapshot of our production floor, deliveries, and installations.
        </p>
      </div>
      <div className="space-y-8">
        {albums.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center text-white/70">
            No gallery items yet.
          </div>
        ) : (
          <GalleryAlbumGrid albums={albums} initialAlbum={requestedAlbum} />
        )}
      </div>
      <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-card">
        <h2 className="text-2xl font-semibold text-white">Need a custom build?</h2>
        <p className="mt-2 text-white/70">Send your specs and we will craft a solution.</p>
        <Link
          href="/contact"
          data-track="cta_request_quote"
          data-track-label="gallery_request_quote"
          className="mt-6 inline-flex rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
        >
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
