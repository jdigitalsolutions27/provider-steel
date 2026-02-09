"use server";

import { prisma } from "@/lib/prisma";
import { assertAuthenticated } from "@/lib/guards";
import { changePasswordSchema, updateProfileSchema } from "@/lib/validation";
import { verifyPassword, hashPassword } from "@/lib/password";
import { saveUpload } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";

export async function changePasswordAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  const session = await assertAuthenticated();

  const raw = {
    currentPassword: String(formData.get("currentPassword") || ""),
    newPassword: String(formData.get("newPassword") || "")
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please provide valid passwords." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, message: "User not found." };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { ok: false, message: "New password must be different from current password." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null
    }
  });
  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email || undefined,
    actorRole: session.user.role,
    action: "ACCOUNT_PASSWORD_CHANGED",
    targetType: "USER",
    targetId: session.user.id,
    message: "User changed own password"
  });

  return { ok: true };
}

export async function updateProfileAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  const session = await assertAuthenticated();
  const raw = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || "")
  };
  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please provide valid profile details."
    };
  }

  const removeAvatar = String(formData.get("removeAvatar") || "") === "on";
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl: string | null | undefined = undefined;
  if (removeAvatar) {
    avatarUrl = null;
  } else if (avatarFile && avatarFile.size > 0) {
    try {
      avatarUrl = await saveUpload(avatarFile);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Avatar upload failed."
      };
    }
  }

  if (parsed.data.email !== session.user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });
    if (existing && existing.id !== session.user.id) {
      return { ok: false, message: "Email already in use." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      ...(avatarUrl !== undefined ? { avatarUrl } : {})
    }
  });
  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email || undefined,
    actorRole: session.user.role,
    action: "ACCOUNT_PROFILE_UPDATED",
    targetType: "USER",
    targetId: session.user.id,
    message: "User updated own profile",
    meta: {
      updatedEmail: parsed.data.email,
      avatarChanged: avatarUrl !== undefined
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/account");

  return { ok: true };
}
