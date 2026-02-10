import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, parseJsonArray } from "@/lib/utils";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LeadPrioritySelect } from "@/components/admin/lead-priority-select";
import { LeadAssignmentSelect } from "@/components/admin/lead-assignment-select";
import { LeadFollowUpInput } from "@/components/admin/lead-followup-input";
import { LeadNoteForm } from "@/components/admin/lead-note-form";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";
import { getSiteSettings } from "@/lib/site";
import { requireSession } from "@/lib/guards";
import {
  approveLeadStatusRequest,
  rejectLeadStatusRequest,
  softDeleteLead
} from "@/app/admin/leads/actions";

export default async function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      product: true,
      service: true,
      assignedTo: true,
      events: { include: { user: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!lead) {
    redirect("/admin/leads");
  }
  const isStaff = session.user.role === "STAFF";
  const isAssigned = !!lead.assignedToUserId && lead.assignedToUserId === session.user.id;
  if (isStaff && !isAssigned) {
    redirect("/admin/leads");
  }

  const [users, settings] = await Promise.all([
    prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    getSiteSettings()
  ]);

  const attachments = parseJsonArray(lead.attachments);
  const noteEvents = lead.events
    .filter((event) => event.type === "NOTE_ADDED")
    .slice()
    .reverse();

  const latestStatusRequest = lead.events.find(
    (event) => event.type === "STATUS_REQUESTED"
  );
  const latestStatusDecision = latestStatusRequest
    ? lead.events.find(
        (event) =>
          (event.type === "STATUS_REQUEST_APPROVED" ||
            event.type === "STATUS_REQUEST_REJECTED") &&
          new Date(event.createdAt).getTime() >
            new Date(latestStatusRequest.createdAt).getTime()
      )
    : null;

  const messageText = encodeURIComponent(
    `Hello, this is ${lead.name}. Following up on my request: ${lead.message}`
  );

  const messengerLink = settings.messengerUrl
    ? `${settings.messengerUrl}?ref=${messageText}`
    : null;
  const whatsappLink = settings.whatsappUrl
    ? `${settings.whatsappUrl}?text=${messageText}`
    : null;

  const lastUpdatedBy = lead.events.find((event) => event.user?.name)?.user?.name;

  const normalizeContactLink = () => {
    if (!lead.contactLink) return null;
    const raw = lead.contactLink.trim();
    if (!raw) return null;

    if (lead.preferredContact === "EMAIL") {
      return raw.startsWith("mailto:") ? raw : `mailto:${raw}`;
    }

    if (lead.preferredContact === "TEXT" || lead.preferredContact === "CALL") {
      return raw.startsWith("tel:") ? raw : `tel:${raw}`;
    }

    if (lead.preferredContact === "WHATSAPP") {
      if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
      const digits = raw.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : raw;
    }

    if (lead.preferredContact === "MESSENGER") {
      if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
      return `https://m.me/${raw.replace(/^@/, "")}`;
    }

    return raw;
  };

  const preferredContactLink = normalizeContactLink();
  const messengerHref =
    lead.preferredContact === "MESSENGER" && preferredContactLink
      ? preferredContactLink
      : messengerLink;
  const whatsappHref =
    lead.preferredContact === "WHATSAPP" && preferredContactLink
      ? preferredContactLink
      : whatsappLink;
  const callHref =
    (lead.preferredContact === "CALL" || lead.preferredContact === "TEXT") &&
    preferredContactLink
      ? preferredContactLink
      : `tel:${lead.phone}`;
  const emailHref =
    lead.preferredContact === "EMAIL" && preferredContactLink
      ? preferredContactLink
      : lead.email
      ? `mailto:${lead.email}`
      : null;

  const preferredLabel =
    lead.preferredContact === "TEXT"
      ? "Text Now"
      : lead.preferredContact === "CALL"
      ? "Call Now"
      : lead.preferredContact === "MESSENGER"
      ? "Message on Messenger"
      : lead.preferredContact === "WHATSAPP"
      ? "Chat on WhatsApp"
      : "Email Now";

  const preferredButtonClass = "relative animate-pulse border-brand-yellow/70";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Lead</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{lead.name}</h2>
            <p className="text-sm text-white/70">{lead.phone}</p>
            {lead.email && <p className="text-sm text-white/70">{lead.email}</p>}
            {lastUpdatedBy && (
              <p className="mt-2 text-xs text-white/50">
                Last updated by: <span className="text-white/70">{lastUpdatedBy}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={callHref}
              className={`rounded-full border px-4 py-2 text-xs font-semibold text-white ${
                lead.preferredContact === "CALL" || lead.preferredContact === "TEXT"
                  ? preferredButtonClass
                  : "border-white/30"
              }`}
            >
              {lead.preferredContact === "CALL" || lead.preferredContact === "TEXT"
                ? preferredLabel
                : "Click to Call"}
            </Link>
            {messengerHref && (
              <Link
                href={messengerHref}
                className={`rounded-full border px-4 py-2 text-xs font-semibold text-white ${
                  lead.preferredContact === "MESSENGER"
                    ? preferredButtonClass
                    : "border-white/30"
                }`}
              >
                {lead.preferredContact === "MESSENGER" ? preferredLabel : "Messenger"}
              </Link>
            )}
            {whatsappHref && (
              <Link
                href={whatsappHref}
                className={`rounded-full border px-4 py-2 text-xs font-semibold text-white ${
                  lead.preferredContact === "WHATSAPP"
                    ? preferredButtonClass
                    : "border-white/30"
                }`}
              >
                {lead.preferredContact === "WHATSAPP" ? preferredLabel : "WhatsApp"}
              </Link>
            )}
            {emailHref && (
              <Link
                href={emailHref}
                className={`rounded-full border px-4 py-2 text-xs font-semibold text-white ${
                  lead.preferredContact === "EMAIL"
                    ? preferredButtonClass
                    : "border-white/30"
                }`}
              >
                {lead.preferredContact === "EMAIL" ? preferredLabel : "Email"}
              </Link>
            )}
            {(lead.status === "COMPLETED" || lead.status === "LOST") &&
              !lead.deletedAt &&
              session.user.role === "ADMIN" && (
                <ConfirmActionForm
                  action={softDeleteLead.bind(null, lead.id)}
                  confirmText={`Move ${lead.name} to the recycle bin?`}
                  confirmTitle="Move to recycle bin"
                  confirmLabel="Move"
                >
                  <button
                    type="submit"
                    className="rounded-full border border-brand-red/50 px-4 py-2 text-xs font-semibold text-brand-red"
                  >
                    Move to Recycle Bin
                  </button>
                </ConfirmActionForm>
              )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Status</p>
            <LeadStatusSelect
              leadId={lead.id}
              status={lead.status as any}
              disabled={session.user.role !== "ADMIN"}
              canRequest={isStaff && isAssigned}
            />
            {session.user.role === "STAFF" && latestStatusDecision && (
              <p
                className={`mt-2 text-[11px] uppercase tracking-[0.2em] ${
                  latestStatusDecision.type === "STATUS_REQUEST_APPROVED"
                    ? "text-emerald-300"
                    : "text-brand-red"
                }`}
              >
                {latestStatusDecision.type === "STATUS_REQUEST_APPROVED"
                  ? "Approved"
                  : "Rejected"}
              </p>
            )}
            {session.user.role === "ADMIN" &&
              latestStatusRequest?.newValue &&
              !latestStatusDecision && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <form
                    action={approveLeadStatusRequest.bind(
                      null,
                      lead.id,
                      latestStatusRequest.newValue as any
                    )}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-brand-yellow/40 px-4 py-2 text-[11px] font-semibold text-brand-yellow"
                    >
                      Approve {latestStatusRequest.newValue}
                    </button>
                  </form>
                  <form action={rejectLeadStatusRequest.bind(null, lead.id, "")}>
                    <button
                      type="submit"
                      className="rounded-full border border-brand-red/40 px-4 py-2 text-[11px] font-semibold text-brand-red"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Priority</p>
            {session.user.role === "ADMIN" || isAssigned ? (
              <LeadPrioritySelect leadId={lead.id} priority={lead.priority as any} />
            ) : (
              <p className="text-sm text-white/70">{lead.priority}</p>
            )}
          </div>
          <div id="assign">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Assigned</p>
            {session.user.role === "ADMIN" ? (
              <LeadAssignmentSelect
                leadId={lead.id}
                users={users}
                assignedTo={lead.assignedToUserId}
              />
            ) : (
              <p className="text-sm text-white/70">
                {lead.assignedTo?.name || "Unassigned"}
              </p>
            )}
          </div>
          <div id="followup">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Follow Up</p>
            {session.user.role === "ADMIN" || isAssigned ? (
              <LeadFollowUpInput leadId={lead.id} followUpAt={lead.followUpAt} />
            ) : (
              <p className="text-sm text-white/70">
                {lead.followUpAt ? formatDateTime(lead.followUpAt) : "Not set"}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Inquiry</p>
            <p className="mt-2 text-sm text-white/70">{lead.inquiryType}</p>
            {lead.product && (
              <p className="text-sm text-white/70">Product: {lead.product.name}</p>
            )}
            {lead.service && (
              <p className="text-sm text-white/70">Service: {lead.service.name}</p>
            )}
            <p className="mt-3 text-sm text-white/70">{lead.message}</p>
            {lead.contactLink && (
              <div className="mt-3 text-sm text-white/70">
                <p>Contact link/handle:</p>
                <Link href={lead.contactLink} className="text-brand-yellow">
                  {lead.contactLink}
                </Link>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Attachments</p>
            {attachments.length === 0 ? (
              <p className="mt-2 text-sm text-white/60">No attachments.</p>
            ) : (
              <div className="mt-3 grid gap-2">
                {attachments.map((item) => (
                  <Link key={item} href={item} className="text-sm text-brand-yellow">
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div id="notes" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Conversation</h3>
          <div className="mt-4">
            <LeadNoteForm
              leadId={lead.id}
              notes={noteEvents}
              currentUserId={session.user.id}
              readOnly={isStaff && !isAssigned}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Activity Log</h3>
          <div className="mt-4 space-y-3">
            {lead.events.filter((event) => event.type !== "NOTE_ADDED").length === 0 ? (
              <p className="text-sm text-white/60">No activity yet.</p>
            ) : (
              lead.events
                .filter((event) => event.type !== "NOTE_ADDED")
                .map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      {event.type}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {event.type === "STATUS_REQUESTED"
                        ? `Requested status: ${event.newValue}`
                        : event.type === "STATUS_REQUEST_REJECTED"
                        ? `Request rejected: ${event.newValue}`
                        : event.newValue || event.oldValue}
                    </p>
                    <p className="mt-2 text-xs text-white/40">
                      {formatDateTime(event.createdAt)}
                      {event.user?.name ? ` - ${event.user.name}` : ""}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
