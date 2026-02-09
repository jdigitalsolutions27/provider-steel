"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { productSchema } from "@/lib/validation";
import { parseJsonArray } from "@/lib/utils";
import { saveUpload } from "@/lib/upload";
import type { ProductFormState } from "@/components/admin/product-form";

function parseSpecs(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch {
    return trimmed;
  }
}

function serializeArray(value?: string | null) {
  const items = parseJsonArray(value);
  return items.length ? JSON.stringify(items) : null;
}

function mergeImages(existing: string[], incoming: string[]) {
  const all = [...existing, ...incoming].map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(all));
}

async function checkSlugAvailable(slug: string, currentId?: string) {
  const existing = await prisma.product.findFirst({
    where: { slug },
    select: { id: true, deletedAt: true }
  });
  if (!existing || (currentId && existing.id === currentId)) return { ok: true };
  if (existing.deletedAt) {
    return {
      ok: false,
      message: "Slug already exists in Recycle Bin. Restore it or use a new slug."
    };
  }
  return { ok: false, message: "Slug already exists. Please choose a unique slug." };
}

async function syncGalleryImages(productName: string, category: string, images: string[]) {
  if (!images.length) return;
  const baseTags = [productName, "Product", `Category:${category}`];

  for (const imageUrl of images) {
    const existing = await prisma.galleryItem.findFirst({
      where: { imageUrl }
    });
    if (!existing) {
      await prisma.galleryItem.create({
        data: {
          title: productName,
          description: "Product image",
          imageUrl,
          tags: JSON.stringify(baseTags)
        }
      });
    } else {
      const existingTags = parseJsonArray(existing.tags);
      const mergedTags = Array.from(
        new Set([
          ...existingTags.filter((tag) => !tag.startsWith("Category:")),
          ...baseTags
        ])
      );
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: {
          deletedAt: null,
          ...(existingTags.includes("Product")
            ? { title: productName, description: "Product image" }
            : {}),
          tags: JSON.stringify(mergedTags)
        }
      });
    }
  }
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await assertAdmin();

  const raw = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    category: formData.get("category"),
    shortDescription: String(formData.get("shortDescription") || ""),
    specs: String(formData.get("specs") || ""),
    colors: String(formData.get("colors") || ""),
    featured: formData.get("featured") ? true : false,
    imageUrl: String(formData.get("imageUrl") || ""),
    imageUrls: String(formData.get("imageUrls") || "")
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete required fields." };
  }

  const slugCheck = await checkSlugAvailable(parsed.data.slug);
  if (!slugCheck.ok) return { ok: false, message: slugCheck.message };

  const file = formData.get("imageFile") as File | null;
  const files = formData.getAll("imageFiles") as File[];
  let imageUrl = parsed.data.imageUrl || undefined;
  const uploadedImages: string[] = [];

  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) {
      imageUrl = saved;
      uploadedImages.push(saved);
    }
  }

  if (files?.length) {
    for (const item of files) {
      if (item && item.size > 0) {
        const saved = await saveUpload(item);
        if (saved) uploadedImages.push(saved);
      }
    }
  }

  const manualImages = parseJsonArray(parsed.data.imageUrls);
  const images = mergeImages([], [...manualImages, ...uploadedImages]);
  if (!imageUrl && images.length) imageUrl = images[0];

  try {
    await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        category: parsed.data.category,
        shortDescription: parsed.data.shortDescription ?? "",
        specs: parseSpecs(parsed.data.specs),
        colors: serializeArray(parsed.data.colors),
        featured: parsed.data.featured ?? false,
        imageUrl,
        images: images.length ? JSON.stringify(images) : null
      }
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug already exists. Please choose a unique slug." };
    }
    throw error;
  }
  await syncGalleryImages(parsed.data.name, parsed.data.category, images);

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await assertAdmin();

  const raw = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    category: formData.get("category"),
    shortDescription: String(formData.get("shortDescription") || ""),
    specs: String(formData.get("specs") || ""),
    colors: String(formData.get("colors") || ""),
    featured: formData.get("featured") ? true : false,
    imageUrl: String(formData.get("imageUrl") || ""),
    imageUrls: String(formData.get("imageUrls") || "")
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete required fields." };
  }

  const slugCheck = await checkSlugAvailable(parsed.data.slug, id);
  if (!slugCheck.ok) return { ok: false, message: slugCheck.message };

  const file = formData.get("imageFile") as File | null;
  const files = formData.getAll("imageFiles") as File[];
  let imageUrl = parsed.data.imageUrl || undefined;
  const uploadedImages: string[] = [];

  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) {
      imageUrl = saved;
      uploadedImages.push(saved);
    }
  }

  if (files?.length) {
    for (const item of files) {
      if (item && item.size > 0) {
        const saved = await saveUpload(item);
        if (saved) uploadedImages.push(saved);
      }
    }
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { images: true }
  });
  const existingImages = parseJsonArray(existing?.images);
  const manualImages = parseJsonArray(parsed.data.imageUrls);
  const images = mergeImages(existingImages, [...manualImages, ...uploadedImages]);
  if (!imageUrl && images.length) imageUrl = images[0];

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        category: parsed.data.category,
        shortDescription: parsed.data.shortDescription ?? "",
        specs: parseSpecs(parsed.data.specs),
        colors: serializeArray(parsed.data.colors),
        featured: parsed.data.featured ?? false,
        imageUrl,
        images: images.length ? JSON.stringify(images) : null
      }
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug already exists. Please choose a unique slug." };
    }
    throw error;
  }
  await syncGalleryImages(parsed.data.name, parsed.data.category, images);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/products");
  revalidatePath("/");
}
