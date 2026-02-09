"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guards";
import { userCreateSchema, userResetSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";

export async function createUserAction(
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  const session = await assertAdmin();

  const raw = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    role: formData.get("role"),
    password: String(formData.get("password") || "")
  };

  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please complete required fields."
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });
  if (existing) {
    return {
      ok: false,
      message: existing.deletedAt
        ? "This user exists in the recycle bin. Restore instead."
        : "Email already exists."
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash,
        passwordChangedAt: new Date()
      }
    });
    await writeAuditLog({
      actorId: session.user.id,
      actorEmail: session.user.email || undefined,
      actorRole: session.user.role,
      action: "USER_CREATED",
      targetType: "USER",
      targetId: created.id,
      message: `Created ${created.email}`
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { ok: false, message: "Email already exists." };
    }
    return { ok: false, message: "Unable to create user. Please try again." };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resetUserPasswordAction(
  id: string,
  _prevState: { ok: boolean; message?: string },
  formData: FormData
) {
  const session = await assertAdmin();
  const raw = { password: String(formData.get("password") || "") };
  const parsed = userResetSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid password."
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id },
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
    action: "USER_PASSWORD_RESET",
    targetType: "USER",
    targetId: id,
    message: "Admin reset user password"
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(id: string) {
  const session = await assertAdmin();
  if (session.user.id === id) {
    return { ok: false, message: "You cannot delete your own account." };
  }

  await prisma.lead.updateMany({
    where: { assignedToUserId: id },
    data: { assignedToUserId: null }
  });
  await prisma.leadEvent.updateMany({
    where: { userId: id },
    data: { userId: null }
  });
  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null
    }
  });
  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email || undefined,
    actorRole: session.user.role,
    action: "USER_DELETED",
    targetType: "USER",
    targetId: id,
    message: "Soft-deleted user account"
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
