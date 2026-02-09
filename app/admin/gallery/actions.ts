"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { gallerySchema } from "@/lib/validation";
import { parseJsonArray } from "@/lib/utils";
import { saveUpload } from "@/lib/upload";
import type { GalleryFormState } from "@/components/admin/gallery-form";

function serializeTags(value?: string | null) {
  const items = parseJsonArray(value);
  return items.length ? JSON.stringify(items) : null;
}

function mergeTags(existing: string[], incoming: string[]) {
  const all = [...existing, ...incoming].map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(all));
}

export async function createGalleryAction(
  _prevState: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  await assertAdmin();

  const raw = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
    tags: String(formData.get("tags") || ""),
    category: String(formData.get("category") || ""),
    featured: formData.get("featured") === "on"
  };

  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Please complete required fields." };

  const file = formData.get("imageFile") as File | null;
  const files = formData.getAll("imageFiles") as File[];
  let imageUrl = parsed.data.imageUrl;
  if (!imageUrl && (!file || file.size === 0) && (!files || files.length === 0)) {
    return { ok: false, message: "Please upload at least one image or provide a URL." };
  }
  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) imageUrl = saved;
  }

  const baseTags = parseJsonArray(parsed.data.tags);
  const categoryTag = parsed.data.category ? [`Category:${parsed.data.category}`] : [];
  const tags = mergeTags(baseTags, categoryTag);

  const created: Array<{ imageUrl: string }> = [];
  if (imageUrl) {
    created.push({
      imageUrl
    });
    await prisma.galleryItem.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        imageUrl,
        tags: tags.length ? JSON.stringify(tags) : null,
        featured: !!parsed.data.featured
      }
    });
  }

  if (files?.length) {
    for (const item of files) {
      if (item && item.size > 0) {
        const saved = await saveUpload(item);
        if (saved) {
          created.push({ imageUrl: saved });
          await prisma.galleryItem.create({
            data: {
              title: parsed.data.title,
              description: parsed.data.description || null,
              imageUrl: saved,
              tags: tags.length ? JSON.stringify(tags) : null,
              featured: !!parsed.data.featured
            }
          });
        }
      }
    }
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { ok: true };
}

export async function updateGalleryAction(
  id: string,
  _prevState: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  await assertAdmin();

  const raw = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
    tags: String(formData.get("tags") || ""),
    category: String(formData.get("category") || ""),
    featured: formData.get("featured") === "on"
  };

  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Please complete required fields." };

  const file = formData.get("imageFile") as File | null;
  let imageUrl = parsed.data.imageUrl;
  if (!imageUrl && (!file || file.size === 0)) {
    return { ok: false, message: "Please upload an image or provide a URL." };
  }
  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) imageUrl = saved;
  }

  const baseTags = parseJsonArray(parsed.data.tags);
  const categoryTag = parsed.data.category ? [`Category:${parsed.data.category}`] : [];
  const tags = mergeTags(baseTags, categoryTag);

  await prisma.galleryItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      imageUrl,
      tags: tags.length ? JSON.stringify(tags) : null,
      featured: !!parsed.data.featured
    }
  });

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${id}`);
  revalidatePath("/gallery");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteGalleryAction(id: string) {
  await assertAdmin();
  await prisma.galleryItem.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function toggleGalleryFeaturedAction(id: string, featured: boolean) {
  await assertAdmin();
  await prisma.galleryItem.update({
    where: { id },
    data: { featured }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { ok: true };
}
