import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/sections/product-card";
import { getSiteSettings } from "@/lib/site";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products | G7 Provider Steel Works",
  description: "Browse colored roofing, roll-up doors, purlins, accessories, and coils."
};

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const settings = await getSiteSettings();
  const customCategories = parseJsonArray(settings.productCategories);
  const distinctCategories = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { category: true },
    distinct: ["category"]
  });
  const categoryValues = Array.from(
    new Set([
      ...customCategories,
      ...distinctCategories.map((item) => item.category)
    ])
  ).filter(Boolean);

  const where = {
    deletedAt: null,
    ...(category && category !== "ALL" && categoryValues.includes(category)
      ? { category }
      : {})
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="page-shell">
      <div className="section-head">
        <p className="section-eyebrow">Products</p>
        <h1 className="section-title font-semibold text-white">Steel & Roofing Catalog</h1>
        <p className="section-copy">
          Filter by category and request a quote instantly.
        </p>
      </div>
      <div className="mb-10 flex flex-wrap gap-2.5">
        {[{ label: "All", value: "ALL" }, ...categoryValues.map((value) => ({
          value,
          label: categoryLabels[value] || value
        }))].map((item) => {
          const active = category === item.value || (!category && item.value === "ALL");
          return (
            <Link
              key={item.value}
              href={item.value === "ALL" ? "/products" : `/products?category=${item.value}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                active
                  ? "border-brand-yellow bg-brand-yellow text-brand-navy"
                  : "border-white/20 bg-white/[0.03] text-white/72 hover:border-white/50 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center text-white/70">
          No products found in this category.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
