import { prisma } from "@/lib/prisma";

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export async function trackServerEvent(input: {
  name: string;
  path?: string;
  source?: string;
  label?: string;
  value?: number;
  ip?: string;
  userAgent?: string;
  meta?: unknown;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: input.name,
        path: input.path || null,
        source: input.source || null,
        label: input.label || null,
        value: typeof input.value === "number" ? input.value : null,
        ip: input.ip || null,
        userAgent: input.userAgent || null,
        meta: input.meta !== undefined ? safeJsonStringify(input.meta) : null
      }
    });
  } catch {
    // Analytics is best-effort and should never break user flows.
  }
}

