import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import type { LeadPriority, LeadSource, LeadStatus } from "@/lib/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") as LeadStatus | null;
  const source = searchParams.get("source") as LeadSource | null;
  const priority = searchParams.get("priority") as LeadPriority | null;
  const assigned = searchParams.get("assigned");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } }
    ];
  }
  if (status) where.status = status;
  if (source) where.source = source;
  if (priority) where.priority = priority;
  if (assigned) where.assignedToUserId = assigned;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const leads = await prisma.lead.findMany({
    where: { ...where, deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  const headers = [
    "id",
    "createdAt",
    "name",
    "phone",
    "email",
    "location",
    "status",
    "priority",
    "source",
    "inquiryType",
    "message",
    "preferredContact",
    "contactLink"
  ];

  const rows = leads.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt.toISOString(),
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    location: lead.location,
    status: lead.status,
    priority: lead.priority,
    source: lead.source,
    inquiryType: lead.inquiryType,
    message: lead.message,
    preferredContact: lead.preferredContact,
    contactLink: lead.contactLink
  }));

  const csv = toCsv(rows, headers);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv"
    }
  });
}
