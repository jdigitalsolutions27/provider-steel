"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { deleteGalleryAction, toggleGalleryFeaturedAction } from "@/app/admin/gallery/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FallbackImage } from "@/components/ui/fallback-image";

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  featured?: boolean;
};

type Album = {
  label: string;
  items: GalleryItem[];
};

type ConfirmTarget = {
  id: string;
  title: string;
  albumLabel: string;
};

export function GalleryAlbumGrid({ albums }: { albums: Album[] }) {
  const [localAlbums, setLocalAlbums] = useState<Album[]>(albums);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [albumVisible, setAlbumVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "featured">("all");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const albumTimer = useRef<number | null>(null);
  const imageTimer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const TRANSITION_MS = 180;
  const [, startTransition] = useTransition();

  const visibleAlbums = useMemo(() => {
    return localAlbums
      .map((album) => ({
        ...album,
        items: viewMode === "featured" ? album.items.filter((item) => item.featured) : album.items
      }))
      .filter((album) => album.items.length > 0);
  }, [localAlbums, viewMode]);

  const summary = useMemo(
    () =>
      visibleAlbums.map((album) => ({
        label: album.label,
        count: album.items.length,
        preview: album.items[0]?.imageUrl
      })),
    [visibleAlbums]
  );

  const active = useMemo(
    () => visibleAlbums.find((album) => album.label === activeLabel) || null,
    [visibleAlbums, activeLabel]
  );

  const openAlbum = (album: Album) => {
    if (albumTimer.current) window.clearTimeout(albumTimer.current);
    setActiveLabel(album.label);
    requestAnimationFrame(() => setAlbumVisible(true));
  };

  const closeAlbum = () => {
    setAlbumVisible(false);
    setImageVisible(false);
    if (albumTimer.current) window.clearTimeout(albumTimer.current);
    albumTimer.current = window.setTimeout(() => {
      setActiveLabel(null);
      setActiveImage(null);
      setActiveIndex(null);
    }, TRANSITION_MS);
  };

  const openImage = (item: GalleryItem, index: number) => {
    if (imageTimer.current) window.clearTimeout(imageTimer.current);
    setActiveImage(item);
    setActiveIndex(index);
    requestAnimationFrame(() => setImageVisible(true));
  };

  const closeImage = () => {
    setImageVisible(false);
    if (imageTimer.current) window.clearTimeout(imageTimer.current);
    imageTimer.current = window.setTimeout(() => {
      setActiveImage(null);
      setActiveIndex(null);
    }, TRANSITION_MS);
  };

  const items = active?.items ?? [];
  const totalItems = items.length;
  const currentIndex = activeIndex ?? 0;

  const showPrev = () => {
    if (!totalItems) return;
    const nextIndex = (currentIndex - 1 + totalItems) % totalItems;
    setActiveIndex(nextIndex);
    setActiveImage(items[nextIndex]);
  };

  const showNext = () => {
    if (!totalItems) return;
    const nextIndex = (currentIndex + 1) % totalItems;
    setActiveIndex(nextIndex);
    setActiveImage(items[nextIndex]);
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeImage) {
          closeImage();
          return;
        }
        if (active) closeAlbum();
      }
      if (!activeImage) return;
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, activeImage, totalItems, currentIndex]);

  useEffect(() => {
    if (!activeLabel) return;
    if (active) return;
    setAlbumVisible(false);
    setImageVisible(false);
    setActiveImage(null);
    setActiveIndex(null);
    setActiveLabel(null);
  }, [active, activeLabel]);

  const handleDeleteConfirm = () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    setConfirmTarget(null);
    setRemovingIds((prev) => new Set(prev).add(target.id));
    if (activeImage?.id === target.id) {
      closeImage();
    }
    startTransition(async () => {
      await deleteGalleryAction(target.id);
    });
    window.setTimeout(() => {
      setLocalAlbums((prev) => {
        const next = prev.map((album) => {
          if (album.label !== target.albumLabel) return album;
          return { ...album, items: album.items.filter((item) => item.id !== target.id) };
        });
        return next;
      });
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
    }, TRANSITION_MS);
  };

  const handleToggleFeatured = (albumLabel: string, item: GalleryItem) => {
    const nextFeatured = !item.featured;
    setTogglingIds((prev) => new Set(prev).add(item.id));
    setLocalAlbums((prev) =>
      prev.map((album) =>
        album.label === albumLabel
          ? {
              ...album,
              items: album.items.map((entry) =>
                entry.id === item.id ? { ...entry, featured: nextFeatured } : entry
              )
            }
          : album
      )
    );

    if (activeImage?.id === item.id) {
      setActiveImage((prev) => (prev ? { ...prev, featured: nextFeatured } : prev));
    }

    if (viewMode === "featured" && !nextFeatured && activeImage?.id === item.id) {
      closeImage();
    }

    startTransition(async () => {
      try {
        await toggleGalleryFeaturedAction(item.id, nextFeatured);
      } catch {
        setLocalAlbums((prev) =>
          prev.map((album) =>
            album.label === albumLabel
              ? {
                  ...album,
                  items: album.items.map((entry) =>
                    entry.id === item.id ? { ...entry, featured: !nextFeatured } : entry
                  )
                }
              : album
          )
        );
        if (activeImage?.id === item.id) {
          setActiveImage((prev) => (prev ? { ...prev, featured: !nextFeatured } : prev));
        }
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    });
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            viewMode === "all"
              ? "border-white/35 bg-white/10 text-white"
              : "border-white/20 text-white/70 hover:border-white/35 hover:text-white"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setViewMode("featured")}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            viewMode === "featured"
              ? "border-amber-300/60 bg-[#2b210a]/80 text-amber-100"
              : "border-white/20 text-white/70 hover:border-white/35 hover:text-white"
          }`}
        >
          Featured only
        </button>
      </div>
      {summary.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
          No gallery items in this view.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {summary.map((album) => (
            <button
              key={album.label}
              type="button"
              onClick={() => {
                const found = visibleAlbums.find((item) => item.label === album.label) || null;
                if (found) openAlbum(found);
              }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-white/30"
            >
              <div className="relative h-36 overflow-hidden bg-white/5">
                {album.preview ? (
                  <FallbackImage
                    src={album.preview}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={album.label}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/50">
                    No images
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {album.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {album.count} items
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="text-white/60">Click to open</span>
                  <Link
                    href={`/admin/gallery/new?category=${encodeURIComponent(album.label)}`}
                    className="text-brand-yellow"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Add Photos
                  </Link>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className={`fixed inset-0 z-50 bg-black/80 p-3 backdrop-blur-sm transition-opacity duration-200 sm:p-6 ${
            albumVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className={`mx-auto flex h-full max-w-6xl flex-col rounded-2xl border border-white/10 bg-brand-navy/95 p-4 shadow-soft transition duration-200 sm:rounded-3xl sm:p-6 ${
              albumVisible ? "translate-y-0 scale-100" : "translate-y-1 scale-95"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {active.label}
                </p>
                <h3 className="text-xl font-semibold text-white">
                  {active.label} Album
                </h3>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
                onClick={() => {
                  closeAlbum();
                }}
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 overflow-auto pr-1 md:grid-cols-3">
              {active.items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openImage(item, index)}
                  className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition duration-200 hover:border-white/30 ${
                    removingIds.has(item.id)
                      ? "pointer-events-none opacity-0 -translate-y-1 scale-95"
                      : "opacity-100"
                  }`}
                >
                  <FallbackImage
                    src={item.imageUrl}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={item.title}
                    className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      {item.featured && (
                        <span className="rounded-full border border-amber-300/60 bg-[#2b210a]/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <Link
                        href={`/admin/gallery/${item.id}`}
                        className="text-brand-yellow"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-white/60 transition hover:text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmTarget({
                            id: item.id,
                            title: item.title,
                            albumLabel: active.label
                          });
                          setActiveImage(null);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="text-white/70 transition hover:text-white disabled:opacity-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleFeatured(active.label, item);
                        }}
                        disabled={togglingIds.has(item.id)}
                      >
                        {item.featured ? "Unfeature" : "Feature"}
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeImage && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm transition-opacity duration-200 sm:p-6 ${
            imageVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className={`relative w-full max-w-6xl rounded-2xl border border-white/15 bg-brand-navy/95 p-3 transition duration-200 sm:rounded-3xl sm:p-4 ${
              imageVisible ? "translate-y-0 scale-100" : "translate-y-1 scale-95"
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-20 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
              onClick={() => closeImage()}
            >
              Close
            </button>
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#102338] to-[#091725] p-2 sm:p-3">
              <button
                type="button"
                className={`absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
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
                className={`absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
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
                src={activeImage.imageUrl}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={activeImage.title}
                className="mx-auto max-h-[72vh] w-full rounded-xl bg-[#071320] object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-white">{activeImage.title}</p>
              <span className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70">
                {currentIndex + 1} / {totalItems}
              </span>
            </div>
            {totalItems > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openImage(item, index)}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                      currentIndex === index
                        ? "border-brand-yellow/70"
                        : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <FallbackImage
                      src={item.imageUrl}
                      fallbackSrc="/placeholders/steel-1.svg"
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Move to recycle bin"
        description={
          confirmTarget
            ? `Move "${confirmTarget.title}" to the recycle bin?`
            : "Move this item to the recycle bin?"
        }
        confirmLabel="Move"
        cancelLabel="Cancel"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
