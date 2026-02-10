"use client";

import { useEffect, useRef, useState } from "react";
import { FallbackImage } from "@/components/ui/fallback-image";

export function ProductGallery({
  images,
  alt
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const active = images[activeIndex] || images[0] || "/placeholders/steel-1.svg";
  const total = images.length;
  const prevImage = total > 1 ? images[(activeIndex - 1 + total) % total] : null;
  const nextImage = total > 1 ? images[(activeIndex + 1) % total] : null;

  const showPrev = () => {
    if (total <= 1) return;
    setImageLoading(true);
    setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
  };

  const showNext = () => {
    if (total <= 1) return;
    setImageLoading(true);
    setActiveIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
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
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft" && total > 1) showPrev();
      if (event.key === "ArrowRight" && total > 1) showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, total]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!images.length) {
    return <div className="flex h-full items-center justify-center text-white/60">No image</div>;
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setImageLoading(true);
          setIsOpen(true);
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left"
        aria-label="Open image preview"
      >
        <FallbackImage
          src={active}
          fallbackSrc="/placeholders/steel-1.svg"
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/85 opacity-0 transition group-hover:opacity-100">
          Open
        </span>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-xl border transition ${
                index === activeIndex
                  ? "border-brand-yellow/60"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <FallbackImage
                src={image}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 py-3 sm:px-6 sm:py-5">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-brand-navy/70 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] uppercase tracking-[0.22em] text-white/50">Product Gallery</p>
                <h4 className="truncate text-sm font-semibold text-white sm:text-base">{alt}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {activeIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
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
              onClick={() => setIsOpen(false)}
            >
              {imageLoading && <div className="absolute inset-0 z-[1] animate-pulse bg-white/10" />}

              <button
                type="button"
                className={`absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  total > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous image"
                disabled={total <= 1}
              >
                Prev
              </button>

              <button
                type="button"
                className={`absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-black/55 text-xs font-semibold transition sm:h-11 sm:w-11 ${
                  total > 1
                    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                    : "cursor-not-allowed border-white/10 text-white/35"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                disabled={total <= 1}
              >
                Next
              </button>

              <FallbackImage
                src={active}
                fallbackSrc="/placeholders/steel-1.svg"
                alt={alt}
                onClick={(event) => event.stopPropagation()}
                onLoad={() => setImageLoading(false)}
                className="relative z-[2] mx-auto h-full max-h-[74vh] w-full rounded-xl bg-[#06101a] object-contain"
              />
            </div>

            {total > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setImageLoading(true);
                      setActiveIndex(index);
                    }}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                      index === activeIndex
                        ? "border-brand-yellow/70"
                        : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <FallbackImage
                      src={image}
                      fallbackSrc="/placeholders/steel-1.svg"
                      alt={`${alt} ${index + 1}`}
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
                disabled={total <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                onClick={showNext}
                disabled={total <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85 disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {prevImage && (
              <FallbackImage
                src={prevImage}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
            {nextImage && (
              <FallbackImage
                src={nextImage}
                fallbackSrc="/placeholders/steel-1.svg"
                alt=""
                aria-hidden
                className="hidden"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
