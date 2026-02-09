import { prisma } from "@/lib/prisma";

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export async function writeAuditLog(input: {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  message?: string;
  meta?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId || null,
        actorEmail: input.actorEmail || null,
        actorRole: input.actorRole || null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId || null,
        message: input.message || null,
        meta: input.meta !== undefined ? safeJsonStringify(input.meta) : null
      }
    });
  } catch {
    // Audit logging is best-effort and should not block writes.
  }
}

