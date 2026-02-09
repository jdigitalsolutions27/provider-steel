import nodemailer from "nodemailer";
import type { Lead } from "@prisma/client";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_NOTIFY_EMAIL } = process.env;

function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

export async function sendLeadNotification(lead: Lead) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_NOTIFY_EMAIL) {
    console.info("Email notification not sent (SMTP not configured)");
    return;
  }

  const transporter = getTransporter();

  const subject = `New Lead: ${lead.name}`;
  const text = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.location ? `Location: ${lead.location}` : null,
    `Inquiry: ${lead.inquiryType}`,
    `Message: ${lead.message}`,
    `Preferred Contact: ${lead.preferredContact}`,
    lead.contactLink ? `Contact Link/Handle: ${lead.contactLink}` : null
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: `G7 Provider Steel <${SMTP_USER}>`,
    to: ADMIN_NOTIFY_EMAIL,
    subject,
    text
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.info("Password reset email not sent (SMTP not configured)");
    console.info(`Password reset URL (${input.to}): ${input.resetUrl}`);
    return;
  }

  const transporter = getTransporter();
  const subject = "Reset your G7 Provider Steel admin password";
  const text = [
    `Hello ${input.name},`,
    "",
    "We received a request to reset your admin password.",
    "Use the link below to set a new password:",
    input.resetUrl,
    "",
    "This link expires in 30 minutes.",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  await transporter.sendMail({
    from: `G7 Provider Steel <${SMTP_USER}>`,
    to: input.to,
    subject,
    text
  });
}
