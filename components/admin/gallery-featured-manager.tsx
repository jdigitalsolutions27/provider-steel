"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toggleGalleryFeaturedAction } from "@/app/admin/gallery/actions";

type GalleryManageItem = {
  id: string;
  title: string;
  imageUrl: string;
  featured: boolean;
  category: string;
};

function parseCategory(tagValue: string | null) {
  if (!tagValue) return "General";
  try {
    const parsed = JSON.parse(tagValue);
    if (Array.isArray(parsed)) {
      const category = parsed.find(
        (item) => typeof item === "string" && item.startsWith("Category:")
      );
      if (typeof category === "string") {
        const label = category.replace("Category:", "").trim();
        return label || "General";
      }
    }
  } catch {
    return "General";
  }
  return "General";
}

export function GalleryFeaturedManager({
  items
}: {
  items: Array<{ id: string; title: string; imageUrl: string; featured: boolean; tags: string | null }>;
}) {
  const [localItems, setLocalItems] = useState<GalleryManageItem[]>(
    items.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      featured: item.featured,
      category: parseCategory(item.tags)
    }))
  );
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isPending, startTransition] = useTransition();

  const featuredItems = useMemo(
    () => localItems.filter((item) => item.featured),
    [localItems]
  );

  const featuredCount = featuredItems.length;

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(localItems.map((item) => item.category))).sort()],
    [localItems]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const nonFeaturedItems = useMemo(() => {
    return localItems
      .filter((item) => !item.featured)
      .filter((item) => (categoryFilter === "All" ? true : item.category === categoryFilter))
      .filter((item) =>
        normalizedQuery ? item.title.toLowerCase().includes(normalizedQuery) : true
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [localItems, categoryFilter, normalizedQuery]);

  const onToggle = (id: string, nextFeatured: boolean) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: nextFeatured } : item))
    );
    setPendingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      try {
        await toggleGalleryFeaturedAction(id, nextFeatured);
      } catch {
        setLocalItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, featured: !nextFeatured } : item))
        );
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const renderItemCard = (item: GalleryManageItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-navy/40 p-3 transition hover:border-white/25"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt={item.title} className="h-16 w-20 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-white/60">{item.category}</p>
        <Link href={`/admin/gallery/${item.id}`} className="text-xs text-brand-yellow">
          Edit
        </Link>
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-white/85">
        <input
          type="checkbox"
          checked={item.featured}
          disabled={pendingIds.has(item.id) || isPending}
          onChange={(event) => onToggle(item.id, event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-brand-yellow focus:ring-brand-yellow/40"
        />
        Featured
      </label>
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Homepage Featured Images</h3>
          <p className="text-xs text-white/60">
            Admin controls exactly what appears in home `Recent Projects`.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-1 text-xs font-semibold text-brand-yellow">
            {featuredCount} featured
          </span>
          <span className="rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
            {localItems.length} total images
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Featured on Homepage
            </h4>
            <span className="text-xs text-white/60">{featuredItems.length} selected</span>
          </div>
          {featuredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-xs text-white/60">
              No featured items selected yet.
            </div>
          ) : (
            <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
              {featuredItems
                .slice()
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((item) => renderItemCard(item))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Gallery Library
            </h4>
            <span className="text-xs text-white/60">{nonFeaturedItems.length} available</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search image title..."
              className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {nonFeaturedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-xs text-white/60">
              No matching gallery items.
            </div>
          ) : (
            <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
              {nonFeaturedItems.map((item) => renderItemCard(item))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
