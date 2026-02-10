import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/app/admin/products/actions";
import { requireAdminSession } from "@/lib/guards";
import { parseJsonArray } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site";

function stringifyValue(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function stringifyColors(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.deletedAt) {
    redirect("/admin/products");
  }
  const settings = await getSiteSettings();
  const categories = parseJsonArray(settings.productCategories);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Products</p>
        <h2 className="text-lg font-semibold text-white">Edit Product</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <ProductForm
          action={updateProductAction.bind(null, product.id)}
          categories={categories}
          initial={{
            name: product.name,
            slug: product.slug,
            category: product.category,
            shortDescription: product.shortDescription,
            specs: stringifyValue(product.specs),
            colors: stringifyColors(product.colors),
            featured: product.featured,
            imageUrl: product.imageUrl,
            imageUrls: parseJsonArray(product.images).join(", ")
          }}
        />
      </div>
    </div>
  );
}
