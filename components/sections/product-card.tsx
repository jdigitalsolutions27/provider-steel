import Link from "next/link";
import type { Product } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { FallbackImage } from "@/components/ui/fallback-image";
import { parseJsonArray } from "@/lib/utils";

function normalizeImageSrc(value: string) {
  return value
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/^\[+|\]+$/g, "");
}

function isLikelyImageSrc(value: string) {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

export function ProductCard({ product }: { product: Product }) {
  const galleryImages = parseJsonArray(product.images);
  const primaryImage = [...galleryImages, product.imageUrl || ""]
    .map((item) => normalizeImageSrc(String(item || "")))
    .find((item) => !!item && isLikelyImageSrc(item));

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-card transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-yellow/40 via-white/20 to-brand-red/40 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative h-52 overflow-hidden bg-brand-steel">
        <FallbackImage
          src={primaryImage || "/placeholders/steel-1.svg"}
          fallbackSrc="/placeholders/steel-1.svg"
          alt={product.name}
          className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <div className="absolute left-4 top-4">
            <Badge className="border-amber-300/70 bg-[#2b210a]/90 text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              Featured
            </Badge>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
          {product.category.replaceAll("_", " ")}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-white">{product.name}</h3>
        <p className="mt-2 text-sm text-white/70">{product.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-brand-yellow transition hover:text-brand-yellow/80"
          >
            View details
          </Link>
          <Link
            href={`/contact?product=${product.slug}`}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
