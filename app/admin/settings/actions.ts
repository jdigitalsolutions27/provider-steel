"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { siteSettingsSchema } from "@/lib/validation";
import { parseJsonArray } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";

function serializeAreas(value?: string | null) {
  const items = parseJsonArray(value);
  return items.length ? JSON.stringify(items) : null;
}

function serializeCategories(value?: string | null) {
  const items = parseJsonArray(value);
  return items.length ? JSON.stringify(items) : null;
}

export async function updateSiteSettingsAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  const session = await assertAdmin();

  const raw = {
    businessName: String(formData.get("businessName") || ""),
    taglineMain: String(formData.get("taglineMain") || ""),
    subtitle: String(formData.get("subtitle") || ""),
    serviceLine: String(formData.get("serviceLine") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    address: String(formData.get("address") || ""),
    messengerUrl: String(formData.get("messengerUrl") || ""),
    whatsappUrl: String(formData.get("whatsappUrl") || ""),
    serviceAreas: String(formData.get("serviceAreas") || ""),
    galleryCategories: String(formData.get("galleryCategories") || ""),
    logoTextSmall: String(formData.get("logoTextSmall") || "")
  };

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please complete all required fields." };
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      ...parsed.data,
      messengerUrl: parsed.data.messengerUrl || null,
      whatsappUrl: parsed.data.whatsappUrl || null,
      serviceAreas: serializeAreas(parsed.data.serviceAreas),
      galleryCategories: serializeCategories(parsed.data.galleryCategories)
    },
    create: {
      id: 1,
      ...parsed.data,
      messengerUrl: parsed.data.messengerUrl || null,
      whatsappUrl: parsed.data.whatsappUrl || null,
      serviceAreas: serializeAreas(parsed.data.serviceAreas),
      galleryCategories: serializeCategories(parsed.data.galleryCategories)
    }
  });
  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email || undefined,
    actorRole: session.user.role,
    action: "SITE_SETTINGS_UPDATED",
    targetType: "SITE_SETTINGS",
    targetId: "1",
    message: "Updated site settings"
  });

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/gallery");
  revalidatePath("/admin/settings");
  return { ok: true };
}
