import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const events = await prisma.leadEvent.findMany({
    where: { leadId: id, type: "NOTE_ADDED" },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const notes = events.map((event) => ({
    id: event.id,
    createdAt: event.createdAt.toISOString(),
    newValue: event.newValue,
    user: event.user
      ? { id: event.user.id, name: event.user.name, avatarUrl: event.user.avatarUrl }
      : null
  }));

  return NextResponse.json({ notes });
}
