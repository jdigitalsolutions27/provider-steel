"use client";

import { useState } from "react";
import { FallbackImage } from "@/components/ui/fallback-image";

export type GalleryLiteItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
};

export function GalleryLightbox({ items }: { items: GalleryLiteItem[] }) {
  const [active, setActive] = useState<GalleryLiteItem | null>(null);

  return (
    <>
      <div className="columns-1 gap-6 space-y-6 md:columns-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item)}
            className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <FallbackImage
              src={item.imageUrl}
              fallbackSrc="/placeholders/steel-1.svg"
              alt={item.title}
              className="w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left text-white opacity-0 transition group-hover:opacity-100">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description && (
                <p className="text-xs text-white/70">{item.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <button
            className="absolute right-6 top-6 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <div className="max-w-3xl rounded-2xl border border-white/10 bg-brand-navy p-4">
            <FallbackImage
              src={active.imageUrl}
              fallbackSrc="/placeholders/steel-1.svg"
              alt={active.title}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            <div className="mt-3 text-white">
              <p className="text-sm font-semibold">{active.title}</p>
              {active.description && (
                <p className="text-xs text-white/70">{active.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
