import { NextResponse } from "next/server";
import { z } from "zod";
import { trackServerEvent } from "@/lib/analytics";

const analyticsSchema = z.object({
  name: z.string().min(2).max(80),
  path: z.string().max(300).optional(),
  source: z.string().max(60).optional(),
  label: z.string().max(180).optional(),
  value: z.number().finite().optional(),
  meta: z.unknown().optional()
});

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = analyticsSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
    }

    await trackServerEvent({
      ...parsed.data,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to track event." }, { status: 500 });
  }
}

