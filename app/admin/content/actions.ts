"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { faqSchema, siteContentSchema, whyUsSchema } from "@/lib/validation";

export async function updateSiteContentAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  await assertAdmin();

  const raw = {
    heroHeading: String(formData.get("heroHeading") || ""),
    heroSubheading: String(formData.get("heroSubheading") || ""),
    ctaPrimaryText: String(formData.get("ctaPrimaryText") || ""),
    ctaSecondaryText: String(formData.get("ctaSecondaryText") || ""),
    aboutIntro: String(formData.get("aboutIntro") || ""),
    aboutBody: String(formData.get("aboutBody") || "")
  };

  const parsed = siteContentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete all required fields." };
  }

  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data }
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function createFaqAction(formData: FormData) {
  await assertAdmin();
  const raw = {
    question: String(formData.get("question") || ""),
    answer: String(formData.get("answer") || ""),
    order: Number(formData.get("order") || 1)
  };
  const parsed = faqSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid FAQ");

  await prisma.fAQItem.create({ data: parsed.data });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function updateFaqAction(id: string, formData: FormData) {
  await assertAdmin();
  const raw = {
    question: String(formData.get("question") || ""),
    answer: String(formData.get("answer") || ""),
    order: Number(formData.get("order") || 1)
  };
  const parsed = faqSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid FAQ");

  await prisma.fAQItem.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteFaqAction(id: string) {
  await assertAdmin();
  await prisma.fAQItem.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function createWhyUsAction(formData: FormData) {
  await assertAdmin();
  const raw = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    iconName: String(formData.get("iconName") || ""),
    order: Number(formData.get("order") || 1)
  };
  const parsed = whyUsSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid item");

  await prisma.whyUsItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      iconName: parsed.data.iconName || null,
      order: parsed.data.order
    }
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function updateWhyUsAction(id: string, formData: FormData) {
  await assertAdmin();
  const raw = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    iconName: String(formData.get("iconName") || ""),
    order: Number(formData.get("order") || 1)
  };
  const parsed = whyUsSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid item");

  await prisma.whyUsItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      iconName: parsed.data.iconName || null,
      order: parsed.data.order
    }
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteWhyUsAction(id: string) {
  await assertAdmin();
  await prisma.whyUsItem.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/");
}