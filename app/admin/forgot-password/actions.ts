"use server";

import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";

export type ForgotPasswordState = {
  ok: boolean;
  message?: string;
};

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get("email") || "").trim()
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Please enter a valid email."
    };
  }

  const email = parsed.data.email;

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email }, { email: email.toLowerCase() }]
    }
  });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: expiresAt
      }
    });

    const resetUrl = `${getBaseUrl()}/admin/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl
    });
  }

  return {
    ok: true,
    message:
      "If that email exists, a reset link has been sent. Check your inbox and spam folder."
  };
}
