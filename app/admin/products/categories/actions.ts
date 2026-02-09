"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { parseJsonArray } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function updateProductCategoriesAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  await assertAdmin();
  const raw = String(formData.get("categories") || "");
  const items = parseJsonArray(raw);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { productCategories: items.length ? JSON.stringify(items) : null },
    create: {
      id: 1,
      businessName: "G7 Provider Steel Works",
      taglineMain: "PROVIDER STEEL",
      subtitle: "WORKS",
      serviceLine: "Colored Roofing & Steel Frames",
      phone: "",
      email: "",
      address: "",
      messengerUrl: "",
      whatsappUrl: "",
      serviceAreas: null,
      galleryCategories: null,
      productCategories: items.length ? JSON.stringify(items) : null,
      logoTextSmall: "G7"
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/categories");
  revalidatePath("/products");
  return { ok: true };
}
