"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { leadCreateSchema } from "@/lib/validation";
import { canSubmit } from "@/lib/throttle";
import { saveUpload } from "@/lib/upload";
import { sendLeadNotification } from "@/lib/email";
import { trackServerEvent } from "@/lib/analytics";
import type { InquiryType, PreferredContact } from "@/lib/enums";

const honeypotField = "company";

async function getIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export type LeadFormState = {
  ok: boolean;
  message?: string;
  preview?: string;
};

export async function createLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const honeypot = String(formData.get(honeypotField) || "");
  if (honeypot) {
    return { ok: true };
  }

  const confirmed = String(formData.get("confirm") || "");
  if (confirmed !== "on") {
    return { ok: false, message: "Please confirm your details before submitting." };
  }

  const ip = await getIp();
  if (!canSubmit(ip)) {
    return { ok: false, message: "Please wait a moment before submitting again." };
  }

  const attachmentUrl = String(formData.get("attachmentUrl") || "").trim();
  const file = formData.get("attachment") as File | null;

  const data = {
    name: String(formData.get("name") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    location: String(formData.get("location") || ""),
    inquiryType: formData.get("inquiryType") as InquiryType,
    productId: String(formData.get("productId") || ""),
    serviceId: String(formData.get("serviceId") || ""),
    message: String(formData.get("message") || ""),
    preferredContact: formData.get("preferredContact") as PreferredContact,
    contactLink: String(formData.get("contactLink") || "")
  };

  const parsed = leadCreateSchema.safeParse({
    ...data,
    productId: data.productId || undefined,
    serviceId: data.serviceId || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Please fill in required fields correctly." };
  }

  const attachments: string[] = [];

  if (file && file.size > 0) {
    try {
      const saved = await saveUpload(file);
      if (saved) attachments.push(saved);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Upload failed."
      };
    }
  }

  if (attachmentUrl) attachments.push(attachmentUrl);

  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      location: parsed.data.location || null,
      inquiryType: parsed.data.inquiryType,
      productId: parsed.data.productId || null,
      serviceId: parsed.data.serviceId || null,
      message: parsed.data.message || "",
      preferredContact: parsed.data.preferredContact,
      contactLink: parsed.data.contactLink || null,
      attachments: attachments.length ? JSON.stringify(attachments) : null
    }
  });

  await prisma.leadEvent.create({
    data: {
      leadId: lead.id,
      type: "CREATED",
      newValue: "Lead submitted via website"
    }
  });

  await sendLeadNotification(lead);
  await trackServerEvent({
    name: "quote_submit",
    path: "/contact",
    source: "website_form",
    label: lead.inquiryType,
    ip
  });

  const product = lead.productId
    ? await prisma.product.findFirst({
        where: { id: lead.productId, deletedAt: null }
      })
    : null;
  const service = lead.serviceId
    ? await prisma.service.findUnique({ where: { id: lead.serviceId } })
    : null;

  const preview = [
    `Hello G7 Provider Steel Works,`,
    `I'm ${lead.name}. Here are my request details:`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.location ? `Location: ${lead.location}` : null,
    product ? `Product: ${product.name}` : null,
    service ? `Service: ${service.name}` : null,
    `Inquiry: ${lead.inquiryType}`,
    `Specs: ${lead.message}`,
    `Preferred contact: ${lead.preferredContact}`,
    lead.contactLink ? `Contact link/handle: ${lead.contactLink}` : null
  ]
    .filter(Boolean)
    .join("\n");

  return { ok: true, preview };
}
