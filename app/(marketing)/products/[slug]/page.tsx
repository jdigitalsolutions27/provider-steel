import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";
import { ProductGallery } from "@/components/sections/product-gallery";

type SpecEntry = [string, string];

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, deletedAt: null }
  });

  return {
    title: product ? `${product.name} | G7 Provider Steel Works` : "Product"
  };
}

function normalizeSpecs(specs: unknown): SpecEntry[] {
  if (!specs) return [];
  if (typeof specs === "string") {
    try {
      const parsed = JSON.parse(specs);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index): SpecEntry => [String(index + 1), String(item)]);
      }
      if (parsed && typeof parsed === "object") {
        return Object.entries(parsed as Record<string, unknown>).map(
          ([key, value]): SpecEntry => [key, String(value)]
        );
      }
    } catch {
      return [["Specs", specs]];
    }
  }
  if (Array.isArray(specs)) {
    return specs.map((item, index): SpecEntry => [String(index + 1), String(item)]);
  }
  if (typeof specs === "object") {
    return Object.entries(specs as Record<string, unknown>).map(
      ([key, value]): SpecEntry => [key, String(value)]
    );
  }
  return [];
}

function parseSpecsText(raw: string): SpecEntry[] {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const bulletParts = raw
    .split(/[\n•]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (bulletParts.length > 1) {
    return bulletParts.map((part): SpecEntry => {
      const idx = part.indexOf(":");
      if (idx > 0) {
        return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
      }
      return ["Spec", part];
    });
  }

  const pairs: SpecEntry[] = [];
  const regex = /([A-Za-z][A-Za-z\s/()-]+):\s*([^:]+?)(?=(?:[A-Za-z][A-Za-z\s/()-]+:\s)|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cleaned))) {
    pairs.push([match[1].trim(), match[2].trim()]);
  }
  return pairs;
}

function expandSpecs(specs: SpecEntry[]): SpecEntry[] {
  if (specs.length === 1) {
    const [label, value] = specs[0];
    if (label.toLowerCase() === "specs" || /^\d+$/.test(label)) {
      const parsed = parseSpecsText(value);
      if (parsed.length > 1) return parsed;
    }
  }
  return specs;
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({ where: { slug: params.slug, deletedAt: null } }),
    getSiteSettings()
  ]);

  if (!product || product.deletedAt) notFound();

  const specs = expandSpecs(normalizeSpecs(product.specs));
  const colors = parseJsonArray(product.colors);
  const galleryImages = parseJsonArray(product.images);
  const images = galleryImages.length
    ? galleryImages
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  return (
    <div className="page-shell">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-eyebrow">
            {product.category.replaceAll("_", " ")}
          </p>
          <h1 className="section-title font-semibold text-white">{product.name}</h1>
          <p className="section-copy">{product.shortDescription}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/contact?product=${product.slug}`}
              data-track="cta_request_quote"
              data-track-label="product_detail_request_quote"
              className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600"
            >
              Request Quote
            </Link>
            <Link
              href={`tel:${settings.phone}`}
              data-track="cta_call_now"
              data-track-label="product_detail_call_now"
              className="rounded-full border border-white/30 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:border-white/60"
            >
              Call Now
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Specifications</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                {specs.length} items
              </span>
            </div>
            {specs.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No specs available yet.</p>
            ) : (
              <dl className="mt-4 grid gap-3">
                {specs.map(([label, value], index) => {
                  const labelText = /^\d+$/.test(label) ? `Spec ${label}` : label;
                  return (
                    <div
                      key={`${label}-${index}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
                        {labelText}
                      </dt>
                      <dd className="mt-1 text-sm text-white/80">{value}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
            <h2 className="text-lg font-semibold text-white">Available Colors</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {colors.length ? (
                colors.map((color) => (
                  <span
                    key={color}
                    className="rounded-full border border-white/20 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/70"
                  >
                    {color}
                  </span>
                ))
              ) : (
                <p className="text-sm text-white/60">Color list available on request.</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
          <ProductGallery images={images} alt={product.name} />
        </div>
      </div>
    </div>
  );
}
