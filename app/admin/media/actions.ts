"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { mediaSchema } from "@/lib/validation";
import { parseJsonArray } from "@/lib/utils";
import { saveUpload } from "@/lib/upload";

function serializeTags(value?: string | null) {
  const items = parseJsonArray(value);
  return items.length ? JSON.stringify(items) : null;
}

export async function createMediaAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  await assertAdmin();

  const file = formData.get("file") as File | null;
  const rawUrl = String(formData.get("url") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const tags = String(formData.get("tags") || "").trim();

  let url = rawUrl;
  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if (saved) url = saved;
  }

  const parsed = mediaSchema.safeParse({ title, url, tags });
  if (!parsed.success) {
    return { ok: false, message: "Provide a valid image URL or upload a file." };
  }

  await prisma.mediaItem.create({
    data: {
      title: parsed.data.title || null,
      url: parsed.data.url,
      tags: serializeTags(parsed.data.tags)
    }
  });

  revalidatePath("/admin/media");
  return { ok: true };
}

export async function deleteMediaAction(id: string) {
  await assertAdmin();
  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item) return;

  await prisma.mediaItem.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  revalidatePath("/admin/media");
  revalidatePath("/admin/recycle-bin");
}
