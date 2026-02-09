"use server";

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validation";

export type ResetPasswordState = {
  ok: boolean;
  message?: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    email: String(formData.get("email") || "").trim(),
    token: String(formData.get("token") || "").trim(),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || "")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid reset request."
    };
  }

  const email = parsed.data.email;
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email }, { email: email.toLowerCase() }]
    }
  });

  if (!user || !user.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
    return { ok: false, message: "Invalid or expired reset link." };
  }

  if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    return { ok: false, message: "Reset link expired. Please request a new one." };
  }

  if (user.passwordResetTokenHash !== tokenHash) {
    return { ok: false, message: "Invalid or expired reset link." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null
    }
  });

  return { ok: true, message: "Password updated. Redirecting to login..." };
}
