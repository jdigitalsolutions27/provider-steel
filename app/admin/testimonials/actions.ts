"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { testimonialProjectSchema } from "@/lib/validation";
import { parseJsonArray } from "@/lib/utils";
import { saveUpload } from "@/lib/upload";
import type { TestimonialFormState } from "@/components/admin/testimonial-form";

function mergeImages(existing: string[], incoming: string[]) {
  const all = [...existing, ...incoming].map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(all));
}

function stripCoverImage(images: string[], coverImage?: string) {
  if (!coverImage) return images;
  return images.filter((item) => item !== coverImage);
}

function parseDateInput(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function checkSlugAvailable(slug: string, currentId?: string) {
  const existing = await prisma.testimonialProject.findFirst({
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

function getValidationMessage(error: { issues?: Array<{ message?: string }> }) {
  return error?.issues?.[0]?.message || "Please complete required fields.";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Upload failed. Please try again.";
}

export async function createTestimonialAction(
  _prevState: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  await assertAdmin();

  const raw = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    details: String(formData.get("details") || ""),
    status: String(formData.get("status") || "ONGOING"),
    statusNote: String(formData.get("statusNote") || ""),
    featured: formData.get("featured") ?? undefined,
    imageUrl: String(formData.get("imageUrl") || ""),
    imageUrls: String(formData.get("imageUrls") || ""),
    location: String(formData.get("location") || ""),
    completedAt: String(formData.get("completedAt") || ""),
    sortOrder: String(formData.get("sortOrder") || "0")
  };

  const parsed = testimonialProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: getValidationMessage(parsed.error) };
  }

  const slugCheck = await checkSlugAvailable(parsed.data.slug);
  if (!slugCheck.ok) return { ok: false, message: slugCheck.message };

  const file = formData.get("imageFile") as File | null;
  const files = formData.getAll("imageFiles") as File[];
  let imageUrl = parsed.data.imageUrl || undefined;
  const uploadedImages: string[] = [];

  if (file && file.size > 0) {
    try {
      const saved = await saveUpload(file);
      if (saved) {
        imageUrl = saved;
        uploadedImages.push(saved);
      }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) };
    }
  }

  if (files?.length) {
    for (const item of files) {
      if (item && item.size > 0) {
        try {
          const saved = await saveUpload(item);
          if (saved) uploadedImages.push(saved);
        } catch (error) {
          return { ok: false, message: getErrorMessage(error) };
        }
      }
    }
  }

  const manualImages = parseJsonArray(parsed.data.imageUrls);
  const images = mergeImages([], [...manualImages, ...uploadedImages]);
  if (!imageUrl && images.length) imageUrl = images[0];
  const additionalImages = stripCoverImage(images, imageUrl);

  if (!imageUrl) {
    return { ok: false, message: "Please upload at least one image or provide an image URL." };
  }

  try {
    await prisma.testimonialProject.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        details: parsed.data.details,
        status: parsed.data.status,
        statusNote: parsed.data.statusNote || null,
        featured: parsed.data.featured ?? false,
        imageUrl,
        images: additionalImages.length ? JSON.stringify(additionalImages) : null,
        location: parsed.data.location || null,
        completedAt: parsed.data.status === "COMPLETED" ? parseDateInput(parsed.data.completedAt) : null,
        sortOrder: parsed.data.sortOrder ?? 0
      }
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug already exists. Please choose a unique slug." };
    }
    throw error;
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { ok: true };
}

export async function updateTestimonialAction(
  id: string,
  _prevState: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  await assertAdmin();

  const raw = {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    details: String(formData.get("details") || ""),
    status: String(formData.get("status") || "ONGOING"),
    statusNote: String(formData.get("statusNote") || ""),
    featured: formData.get("featured") ?? undefined,
    imageUrl: String(formData.get("imageUrl") || ""),
    imageUrls: String(formData.get("imageUrls") || ""),
    location: String(formData.get("location") || ""),
    completedAt: String(formData.get("completedAt") || ""),
    sortOrder: String(formData.get("sortOrder") || "0")
  };

  const parsed = testimonialProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: getValidationMessage(parsed.error) };
  }

  const slugCheck = await checkSlugAvailable(parsed.data.slug, id);
  if (!slugCheck.ok) return { ok: false, message: slugCheck.message };

  const file = formData.get("imageFile") as File | null;
  const files = formData.getAll("imageFiles") as File[];
  let imageUrl = parsed.data.imageUrl || undefined;
  const uploadedImages: string[] = [];

  if (file && file.size > 0) {
    try {
      const saved = await saveUpload(file);
      if (saved) {
        imageUrl = saved;
        uploadedImages.push(saved);
      }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error) };
    }
  }

  if (files?.length) {
    for (const item of files) {
      if (item && item.size > 0) {
        try {
          const saved = await saveUpload(item);
          if (saved) uploadedImages.push(saved);
        } catch (error) {
          return { ok: false, message: getErrorMessage(error) };
        }
      }
    }
  }

  const existing = await prisma.testimonialProject.findUnique({
    where: { id },
    select: { images: true, imageUrl: true }
  });
  const existingImages = stripCoverImage(parseJsonArray(existing?.images), existing?.imageUrl || undefined);
  const manualImages = parseJsonArray(parsed.data.imageUrls);
  const images = mergeImages(existingImages, [...manualImages, ...uploadedImages]);
  if (!imageUrl && existing?.imageUrl) imageUrl = existing.imageUrl;
  if (!imageUrl && images.length) imageUrl = images[0];
  const additionalImages = stripCoverImage(images, imageUrl);

  if (!imageUrl) {
    return { ok: false, message: "Please upload at least one image or provide an image URL." };
  }

  try {
    await prisma.testimonialProject.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        details: parsed.data.details,
        status: parsed.data.status,
        statusNote: parsed.data.statusNote || null,
        featured: parsed.data.featured ?? false,
        imageUrl,
        images: additionalImages.length ? JSON.stringify(additionalImages) : null,
        location: parsed.data.location || null,
        completedAt: parsed.data.status === "COMPLETED" ? parseDateInput(parsed.data.completedAt) : null,
        sortOrder: parsed.data.sortOrder ?? 0
      }
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { ok: false, message: "Slug already exists. Please choose a unique slug." };
    }
    throw error;
  }

  revalidatePath("/admin/testimonials");
  revalidatePath(`/admin/testimonials/${id}`);
  revalidatePath("/testimonials");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTestimonialAction(id: string) {
  await assertAdmin();
  await prisma.testimonialProject.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/testimonials");
  revalidatePath("/");
}
