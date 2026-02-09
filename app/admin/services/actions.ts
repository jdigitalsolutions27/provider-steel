"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { serviceSchema } from "@/lib/validation";
import type { ServiceFormState } from "@/components/admin/service-form";

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await assertAdmin();

  const raw = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    featured: formData.get("featured") ? true : false,
    iconName: String(formData.get("iconName") || "")
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete required fields." };
  }

  await prisma.service.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      featured: parsed.data.featured ?? false,
      iconName: parsed.data.iconName || null
    }
  });

  revalidatePath("/admin/services");
  return { ok: true };
}

export async function updateServiceAction(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await assertAdmin();

  const raw = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    featured: formData.get("featured") ? true : false,
    iconName: String(formData.get("iconName") || "")
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete required fields." };
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      featured: parsed.data.featured ?? false,
      iconName: parsed.data.iconName || null
    }
  });

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  return { ok: true };
}

export async function deleteServiceAction(id: string) {
  await assertAdmin();
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
}