"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FallbackImage } from "@/components/ui/fallback-image";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  createdAt?: string | Date;
};

type Album = {
  label: string;
  items: GalleryItem[];
};

function toTimestamp(value?: string | Date) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function cardSizeClass(index: number) {
  if (index % 7 === 0) return "sm:col-span-2 sm:row-span-2";
  if (index % 7 === 3) return "sm:col-span-2";
  return "";
}

export function GalleryAlbumGrid({
  albums,
  initialAlbum
}: {
  albums: Album[];
  initialAlbum?: string;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az">("newest");

  const [activeAlbumLabel, setActiveAlbumLabel] = useState<string | null>(null);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  const didAutoOpen = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const albumLabels = useMemo(() => ["All", ...albums.map((album) => album.label)], [albums]);

  const visibleAlbums = useMemo(() => {
    const filtered =
      activeFilter === "All" ? albums : albums.filter((album) => album.label === activeFilter);

    const sorted = [...filtered];
    if (sortBy === "az") {
      sorted.sort((a, b) => a.label.localeCompare(b.label));
      return sorted;
    }

    sorted.sort((a, b) => {
      const aLatest = toTimestamp(a.items[0]?.createdAt);
      const bLatest = toTimestamp(b.items[0]?.createdAt);
      return sortBy === "newest" ? bLatest - aLatest : aLatest - bLatest;
    });

    return sorted;
  }, [activeFilter, albums, sortBy]);

  const summary = useMemo(
    () =>
      visibleAlbums.map((album) => ({
        label: album.label,
        count: album.items.length,
        preview: album.items[0]?.imageUrl,
        latest: album.items[0]?.createdAt
      })),
    [visibleAlbums]
  );

  const activeAlbum = useMemo(
    () => albums.find((album) => album.label === activeAlbumLabel) || null,
    [albums, activeAlbumLabel]
  );

  const activeItems = activeAlbum?.items || [];
  const activeItem = activeItems[activeImageIndex] || null;
  const totalItems = activeItems.length;

  const prevItem = totalItems > 1 ? activeItems[(activeImageIndex - 1 + totalItems) % totalItems] : null;
  const nextItem = totalItems > 1 ? activeItems[(activeImageIndex + 1) % totalItems] : null;

  const openAlbum = (label: string) => {
    setActiveAlbumLabel(label);
    setIsAlbumOpen(true);
    setIsLightboxOpen(false);
  };

  const closeAlbum = () => {
    setIsLightboxOpen(false);
    setIsAlbumOpen(false);
  };

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setImageLoading(true);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const showPrev = () => {
    if (!totalItems) return;
    setImageLoading(true);
    setActiveImageIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const showNext = () => {
    if (!totalItems) return;
    setImageLoading(true);
    setActiveImageIndex((prev) => (prev + 1) % totalItems);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (delta > threshold) showNext();
    if (delta < -threshold) showPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (activeFilter !== "All" && !albums.some((album) => album.label === activeFilter)) {
      setActiveFilter("All");
    }
  }, [activeFilter, albums]);

  useEffect(() => {
    if (!initialAlbum || didAutoOpen.current) return;

    const target = initialAlbum.trim().toLowerCase();
    if (!target) return;

    const found = albums.find((album) => album.label.toLowerCase() === target);
    if (!found) return;

    didAutoOpen.current = true;
    setActiveFilter(found.label);
    openAlbum(found.label);
  }, [albums, initialAlbum]);

  useEffect(() => {
    if (!isAlbumOpen && !isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isLightboxOpen) {
          closeLightbox();
          return;
        }
        if (isAlbumOpen) {
          closeAlbum();
        }
      }

      if (!isLightboxOpen) return;
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isAlbumOpen, isLightboxOpen, totalItems, activeImageIndex]);

  useEffect(() => {
    const hasOverlay = isAlbumOpen || isLightboxOpen;
    if (!hasOverlay) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isAlbumOpen, isLightboxOpen]);

  return (
    <>
      <div className="sticky top-20 z-20 mb-6 rounded-2xl border border-white/10 bg-brand-navy/80 p-3 backdrop-blur sm:top-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {albumLabels.map((label) => {
              const selected = label === activeFilter;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveFilter(label)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-brand-yellow/60 bg-brand-yellow/20 text-brand-yellow"
                      : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/50">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "newest" | "oldest" | "az")}
              className="rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
              aria-label="Sort gallery albums"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {summary.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
          No albums found for this category.
        </div>
      ) : (
        <div className="grid auto-rows-[190px] gap-4 sm:auto-rows-[220px] sm:grid-cols-2 xl:grid-cols-3">
          {summary.map((album, index) => (
            <button
              key={album.label}
              type="button"
              onClick={() => openAlbum(album.label)}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left shadow-card transition hover:-translate-y-1 hover:border-white/30 hover:shadow-soft ${cardSizeClass(
                index
              )}`}
            >
              <div className="absolute inset-0 bg-white/5">
                {album.preview ? (
                  <FallbackImage
                    src={album.preview}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={album.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/50">No images</div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                <span className="truncate rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/85">
                  {album.label}
                </span>
                <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80">
                  {album.count}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs text-white/80">Tap to open album</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isAlbumOpen && activeAlbum && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close album"
            className="absolute inset-0 bg-black/75"
            onClick={closeAlbum}
          />

          <div className="relative mx-auto mt-2 flex h-[calc(100vh-1rem)] max-w-7xl flex-col rounded-2xl border border-white/10 bg-brand-navy/95 p-4 shadow-soft sm:mt-5 sm:h-[calc(100vh-2.5rem)] sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{activeAlbum.label}</p>
                <h3 className="text-xl font-semibold text-white">{activeAlbum.label} Album</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/75">
                  {activeAlbum.items.length} images
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  onClick={closeAlbum}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
              {activeAlbum.items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-white/30"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-white/5 sm:aspect-[4/3]">
                    <FallbackImage
                      src={item.imageUrl}
                      fallbackSrc="/placeholders/steel-1.svg"
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <p className="line-clamp-1 text-xs font-semibold text-white sm:text-sm">{item.title}</p>
                    {item.description && (
                      <p className="line-clamp-1 text-[11px] text-white/60 sm:text-xs">{item.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLightboxOpen && activeItem && activeAlbum && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 py-3 sm:px-6 sm:py-5">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-brand-navy/70 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] uppercase tracking-[0.22em] text-white/50">{activeAlbum.label}</p>
                <h4 className="truncate text-sm font-semibold text-white sm:text-base">{activeItem.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {activeImageIndex + 1} / {totalItems}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
                  onClick={closeLightbox}
                >
                  Close
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#102338] to-[#081423] p-2 sm:p-3"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {imageLoading && (
                <div className="absolute inset-0 z-[1] animate-pulse bg-white/10" />
              )}

              <button
                type="button"
                className={`absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  totalItems > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={showPrev}
                aria-label="Previous image"
                disabled={totalItems <= 1}
              >
                Prev
              </button>

              <button
                type="button"
                className={`absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  totalItems > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={showNext}
                aria-label="Next image"
                disabled={totalItems <= 1}
              >
                Next
              </button>

              <FallbackImage
                src={activeItem.imageUrl}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={activeItem.title}
                onLoad={() => setImageLoading(false)}
                className="relative z-[2] mx-auto h-full max-h-[74vh] w-full rounded-xl bg-[#06101a] object-contain"
              />
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-brand-navy/70 px-3 py-2.5">
              <p className="line-clamp-1 text-sm font-semibold text-white">{activeItem.title}</p>
              <p className="line-clamp-1 text-xs text-white/60">
                {activeItem.description || "Project image"}
              </p>
            </div>

            {totalItems > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {activeItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openLightbox(index)}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                      activeImageIndex === index
                        ? "border-brand-yellow/70"
                        : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <FallbackImage
                      src={item.imageUrl}
                      fallbackSrc="/placeholders/steel-1.svg"
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="sm:hidden fixed bottom-3 left-3 right-3 z-20 flex items-center justify-between rounded-full border border-white/15 bg-black/60 px-3 py-2 backdrop-blur">
              <button
                type="button"
                onClick={showPrev}
                disabled={totalItems <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                {activeImageIndex + 1} / {totalItems}
              </span>
              <button
                type="button"
                onClick={showNext}
                disabled={totalItems <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {prevItem && (
              <FallbackImage
                src={prevItem.imageUrl}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
            {nextItem && (
              <FallbackImage
                src={nextItem.imageUrl}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
