import Link from "next/link";
import type { GalleryItem } from "@prisma/client";
import { parseJsonArray } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

function parseTags(tags?: string | null) {
  if (!tags) return [];
  const parsed = parseJsonArray(tags);
  if (parsed.length) return parsed;
  return tags
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((tag) => tag.replace(/['"]/g, "").trim())
    .filter(Boolean);
}

function pickCategoryLabel(tags?: string | null) {
  const parsed = parseTags(tags);
  const categoryTag = parsed.find((tag) => tag.startsWith("Category:"));
  if (!categoryTag) return "";
  const raw = categoryTag.replace("Category:", "").trim();
  return categoryLabels[raw] || raw;
}

function pickPrimaryTag(tags?: string | null) {
  const parsed = parseTags(tags);
  const nonCategory = parsed.find((tag) => !tag.startsWith("Category:"));
  if (nonCategory) return nonCategory;
  return pickCategoryLabel(tags);
}

export function GalleryCard({ item, featured = false }: { item: GalleryItem; featured?: boolean }) {
  const primaryTag = pickPrimaryTag(item.tags);
  const categoryLabel = pickCategoryLabel(item.tags);
  const cardSpan = featured ? "sm:col-span-2 lg:col-span-2" : "";
  const aspect = featured ? "aspect-[16/10]" : "aspect-[4/3]";
  const href = categoryLabel
    ? { pathname: "/gallery", query: { album: categoryLabel } }
    : "/gallery";

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-card transition duration-300 hover:-translate-y-1 hover:border-white/35 hover:shadow-soft ${cardSpan}`}
      aria-label={
        categoryLabel
          ? `Open ${categoryLabel} album for ${item.title}`
          : `Open gallery for ${item.title}`
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-brand-yellow/60 via-white/30 to-brand-red/60 opacity-80 transition duration-300 group-hover:opacity-100" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className={`h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.05] group-hover:brightness-[1.04] ${aspect}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/15" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-navy/35 via-transparent to-brand-yellow/10 opacity-70 transition duration-300 group-hover:opacity-100" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
          Recent
        </span>
        {primaryTag && (
          <span className="max-w-[220px] truncate rounded-full border border-amber-300/60 bg-[#2b210a]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            {primaryTag}
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="line-clamp-1 text-sm font-semibold sm:text-base">{item.title}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-white/75">
          <p className="line-clamp-1">{item.description || "Fabrication and installation progress capture"}</p>
          <span className="shrink-0 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-semibold uppercase tracking-[0.15em] text-white/85">
            Open
          </span>
        </div>
      </div>
    </Link>
  );
}
