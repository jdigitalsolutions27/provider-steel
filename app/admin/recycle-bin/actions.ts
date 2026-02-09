"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

async function deleteUploadIfLocal(url: string | null) {
  if (!url) return;
  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url.replace("/", ""));
  try {
    await unlink(filePath);
  } catch {
    // ignore missing files
  }
}

export async function restoreLead(leadId: string) {
  await assertAdmin();
  await prisma.lead.update({
    where: { id: leadId },
    data: { deletedAt: null }
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      type: "RESTORED",
      newValue: "Restored from recycle bin"
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeLead(leadId: string) {
  await assertAdmin();
  await prisma.leadEvent.deleteMany({ where: { leadId } });
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin/recycle-bin");
}

export async function purgeSelectedLeads(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const leads = await prisma.lead.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true }
  });
  if (!leads.length) return;

  const ids = leads.map((lead) => lead.id);
  await prisma.leadEvent.deleteMany({ where: { leadId: { in: ids } } });
  await prisma.lead.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/recycle-bin");
}

export async function restoreGalleryItem(id: string) {
  await assertAdmin();
  await prisma.galleryItem.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/gallery");
}

export async function purgeGalleryItem(id: string) {
  await assertAdmin();
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.galleryItem.delete({ where: { id } });
  await deleteUploadIfLocal(item.imageUrl);
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/gallery");
}

export async function purgeSelectedGalleryItems(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const items = await prisma.galleryItem.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true, imageUrl: true }
  });
  if (!items.length) return;

  for (const item of items) {
    await deleteUploadIfLocal(item.imageUrl);
  }
  await prisma.galleryItem.deleteMany({
    where: { id: { in: items.map((item) => item.id) } }
  });
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/gallery");
}

export async function restoreMediaItem(id: string) {
  await assertAdmin();
  await prisma.mediaItem.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/admin/media");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeMediaItem(id: string) {
  await assertAdmin();
  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.mediaItem.delete({ where: { id } });
  await deleteUploadIfLocal(item.url);
  revalidatePath("/admin/recycle-bin");
}

export async function purgeSelectedMediaItems(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const items = await prisma.mediaItem.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true, url: true }
  });
  if (!items.length) return;

  for (const item of items) {
    await deleteUploadIfLocal(item.url);
  }
  await prisma.mediaItem.deleteMany({
    where: { id: { in: items.map((item) => item.id) } }
  });
  revalidatePath("/admin/recycle-bin");
}

export async function restoreUser(id: string) {
  await assertAdmin();
  await prisma.user.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeUser(id: string) {
  await assertAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;

  await prisma.lead.updateMany({
    where: { assignedToUserId: id },
    data: { assignedToUserId: null }
  });
  await prisma.leadEvent.updateMany({
    where: { userId: id },
    data: { userId: null }
  });
  await prisma.user.delete({ where: { id } });
  await deleteUploadIfLocal(user.avatarUrl ?? null);
  revalidatePath("/admin/users");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeSelectedUsers(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const users = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true, avatarUrl: true }
  });
  if (!users.length) return;

  const ids = users.map((user) => user.id);
  await prisma.lead.updateMany({
    where: { assignedToUserId: { in: ids } },
    data: { assignedToUserId: null }
  });
  await prisma.leadEvent.updateMany({
    where: { userId: { in: ids } },
    data: { userId: null }
  });
  for (const user of users) {
    await deleteUploadIfLocal(user.avatarUrl ?? null);
  }
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeOldDeletedLeads() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const leads = await prisma.lead.findMany({
    where: { deletedAt: { lte: cutoff } },
    select: { id: true }
  });

  if (leads.length === 0) return;
  const ids = leads.map((lead) => lead.id);

  await prisma.leadEvent.deleteMany({ where: { leadId: { in: ids } } });
  await prisma.lead.deleteMany({ where: { id: { in: ids } } });
}

export async function purgeOldDeletedAssets() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  const [galleryItems, mediaItems] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { deletedAt: { lte: cutoff } },
      select: { id: true, imageUrl: true }
    }),
    prisma.mediaItem.findMany({
      where: { deletedAt: { lte: cutoff } },
      select: { id: true, url: true }
    })
  ]);

  for (const item of galleryItems) {
    await deleteUploadIfLocal(item.imageUrl);
  }
  for (const item of mediaItems) {
    await deleteUploadIfLocal(item.url);
  }

  if (galleryItems.length) {
    await prisma.galleryItem.deleteMany({
      where: { id: { in: galleryItems.map((item) => item.id) } }
    });
  }
  if (mediaItems.length) {
    await prisma.mediaItem.deleteMany({
      where: { id: { in: mediaItems.map((item) => item.id) } }
    });
  }
}

export async function restoreProduct(id: string) {
  await assertAdmin();
  await prisma.product.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/recycle-bin");
}

export async function purgeProduct(id: string) {
  await assertAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function purgeSelectedProducts(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const products = await prisma.product.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true }
  });
  if (!products.length) return;

  await prisma.product.deleteMany({
    where: { id: { in: products.map((item) => item.id) } }
  });
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function purgeOldDeletedProducts() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const products = await prisma.product.findMany({
    where: { deletedAt: { lte: cutoff } },
    select: { id: true }
  });
  if (!products.length) return;
  await prisma.product.deleteMany({
    where: { id: { in: products.map((item) => item.id) } }
  });
}

export async function restoreTestimonialProject(id: string) {
  await assertAdmin();
  await prisma.testimonialProject.update({
    where: { id },
    data: { deletedAt: null }
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/testimonials");
}

export async function purgeTestimonialProject(id: string) {
  await assertAdmin();
  const project = await prisma.testimonialProject.findUnique({ where: { id } });
  if (!project) return;
  await prisma.testimonialProject.delete({ where: { id } });
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function purgeSelectedTestimonialProjects(formData: FormData) {
  await assertAdmin();
  if (String(formData.get("selectAll") ?? "") !== "on") return;

  const projects = await prisma.testimonialProject.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true }
  });
  if (!projects.length) return;

  await prisma.testimonialProject.deleteMany({
    where: { id: { in: projects.map((item) => item.id) } }
  });
  revalidatePath("/admin/recycle-bin");
  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
}

export async function purgeOldDeletedTestimonialProjects() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const projects = await prisma.testimonialProject.findMany({
    where: { deletedAt: { lte: cutoff } },
    select: { id: true }
  });
  if (!projects.length) return;
  await prisma.testimonialProject.deleteMany({
    where: { id: { in: projects.map((item) => item.id) } }
  });
}

export async function purgeOldDeletedUsers() {
  await assertAdmin();
  const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { deletedAt: { lte: cutoff } },
    select: { id: true, avatarUrl: true }
  });
  if (users.length === 0) return;

  const ids = users.map((user) => user.id);

  await prisma.lead.updateMany({
    where: { assignedToUserId: { in: ids } },
    data: { assignedToUserId: null }
  });
  await prisma.leadEvent.updateMany({
    where: { userId: { in: ids } },
    data: { userId: null }
  });
  for (const user of users) {
    await deleteUploadIfLocal(user.avatarUrl ?? null);
  }
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
