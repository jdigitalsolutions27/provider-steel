"use server";

import { prisma } from "@/lib/prisma";
import { assertAuthenticated, assertAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadPriority, LeadStatus } from "@/lib/enums";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const session = await assertAdmin();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  if (lead.status !== status) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });
    await prisma.leadEvent.create({
      data: {
        leadId,
        userId: session.user?.id as string | undefined,
        type: "STATUS_CHANGED",
        oldValue: lead.status,
        newValue: status
      }
    });
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function requestLeadStatusChange(leadId: string, status: LeadStatus) {
  const session = await assertAuthenticated();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (session.user?.role === "STAFF" && lead.assignedToUserId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "STATUS_REQUESTED",
      oldValue: lead.status,
      newValue: status
    }
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export async function approveLeadStatusRequest(leadId: string, status: LeadStatus) {
  const session = await assertAdmin();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  if (lead.status !== status) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });

    await prisma.leadEvent.create({
      data: {
        leadId,
        userId: session.user?.id as string | undefined,
        type: "STATUS_CHANGED",
        oldValue: lead.status,
        newValue: status
      }
    });
  }

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "STATUS_REQUEST_APPROVED",
      newValue: status
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function rejectLeadStatusRequest(leadId: string, reason?: string) {
  const session = await assertAdmin();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "STATUS_REQUEST_REJECTED",
      newValue: reason || "Rejected"
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateLeadPriority(leadId: string, priority: LeadPriority) {
  const session = await assertAuthenticated();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (session.user?.role === "STAFF" && lead.assignedToUserId !== session.user.id) {
    throw new Error("Forbidden");
  }

  if (lead.priority !== priority) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { priority }
    });
    await prisma.leadEvent.create({
      data: {
        leadId,
        userId: session.user?.id as string | undefined,
        type: "PRIORITY_CHANGED",
        oldValue: lead.priority,
        newValue: priority
      }
    });
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateLeadAssignment(leadId: string, userId?: string) {
  const session = await assertAdmin();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  await prisma.lead.update({
    where: { id: leadId },
    data: { assignedToUserId: userId || null }
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "ASSIGNED",
      oldValue: lead.assignedToUserId || "Unassigned",
      newValue: userId || "Unassigned"
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateLeadFollowUp(leadId: string, followUpAt?: string) {
  const session = await assertAuthenticated();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (session.user?.role === "STAFF" && lead.assignedToUserId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const followUpDate = followUpAt ? new Date(followUpAt) : null;

  await prisma.lead.update({
    where: { id: leadId },
    data: { followUpAt: followUpDate }
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "FOLLOWUP_SET",
      oldValue: lead.followUpAt ? lead.followUpAt.toISOString() : "None",
      newValue: followUpDate ? followUpDate.toISOString() : "None"
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function addLeadNote(leadId: string, note: string) {
  const session = await assertAuthenticated();
  const trimmed = note.trim();
  if (!trimmed) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (session.user?.role === "STAFF" && lead.assignedToUserId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { notes: trimmed }
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "NOTE_ADDED",
      newValue: trimmed
    }
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export async function softDeleteLead(leadId: string) {
  const session = await assertAdmin();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (lead.status !== "COMPLETED" && lead.status !== "LOST") {
    throw new Error("Only COMPLETED or LOST leads can be deleted.");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { deletedAt: new Date() }
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      userId: session.user?.id as string | undefined,
      type: "DELETED",
      newValue: "Moved to recycle bin"
    }
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/recycle-bin");

  redirect("/admin/leads");
}
