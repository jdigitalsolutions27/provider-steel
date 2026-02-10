import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/admin/empty-state";
import { requireSession } from "@/lib/guards";
import { AssignedUserCell } from "@/components/admin/assigned-user-cell";
import {
  LeadPriorityValues,
  LeadSourceValues,
  LeadStatusValues,
  type LeadPriority,
  type LeadSource,
  type LeadStatus
} from "@/lib/enums";

const pageSize = 10;

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    source?: string;
    priority?: string;
    assigned?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const query = await searchParams;
  const session = await requireSession();
  const page = Number(query.page || 1);
  const q = query.q?.trim();
  const status = query.status as LeadStatus | undefined;
  const source = query.source as LeadSource | undefined;
  const priority = query.priority as LeadPriority | undefined;
  const assigned = query.assigned;

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

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      where.createdAt.gte = new Date(query.from);
    }
    if (query.to) {
      const end = new Date(query.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [leads, total, users] = await Promise.all([
    prisma.lead.findMany({
      where: { ...where, deletedAt: null },
      include: {
        assignedTo: true,
        events: {
          where: {
            type: {
              in: [
                "STATUS_REQUESTED",
                "STATUS_REQUEST_APPROVED",
                "STATUS_REQUEST_REJECTED"
              ]
            }
          },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.lead.count({ where: { ...where, deletedAt: null } }),
    prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } })
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const queryParams = new URLSearchParams();
  if (q) queryParams.set("q", q);
  if (status) queryParams.set("status", status);
  if (source) queryParams.set("source", source);
  if (priority) queryParams.set("priority", priority);
  if (assigned) queryParams.set("assigned", assigned);
  if (query.from) queryParams.set("from", query.from);
  if (query.to) queryParams.set("to", query.to);

  return (
    <div className="space-y-7">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white">Leads Pipeline</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-6" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name/phone"
            className="md:col-span-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          >
            <option value="">Status</option>
            {LeadStatusValues.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="source"
            defaultValue={source || ""}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          >
            <option value="">Source</option>
            {LeadSourceValues.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="priority"
            defaultValue={priority || ""}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          >
            <option value="">Priority</option>
            {LeadPriorityValues.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="assigned"
            defaultValue={assigned || ""}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          >
            <option value="">Assigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
            <input
              type="date"
              name="from"
              defaultValue={query.from}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
            <input
              type="date"
              name="to"
              defaultValue={query.to}
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-600 md:col-span-2"
          >
            Apply Filters
          </button>
          <Link
            href="/admin/leads"
            className="rounded-full border border-white/20 px-4 py-2 text-center text-sm text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Reset
          </Link>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Leads</h3>
          <Link
            href={`/admin/leads/export?${queryParams.toString()}`}
            className="text-sm font-semibold text-brand-yellow transition hover:text-brand-yellow/80"
          >
            Export CSV
          </Link>
        </div>
        {leads.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No leads found" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-[980px] w-full text-sm text-white/70">
              <thead className="bg-white/[0.04]">
                <tr className="text-left text-xs uppercase tracking-[0.3em] text-white/50">
                  <th className="px-3 py-3">Lead</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Assigned</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isStaff = session.user.role === "STAFF";
                  const isAssigned =
                    !!lead.assignedToUserId && lead.assignedToUserId === session.user.id;
                  const latestRequest = lead.events.find(
                    (event) => event.type === "STATUS_REQUESTED"
                  );
                  const latestDecision = latestRequest
                    ? lead.events.find(
                        (event) =>
                          (event.type === "STATUS_REQUEST_APPROVED" ||
                            event.type === "STATUS_REQUEST_REJECTED") &&
                          new Date(event.createdAt).getTime() >
                            new Date(latestRequest.createdAt).getTime()
                      )
                    : null;

                  return (
                    <tr key={lead.id} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                      <td className="px-3 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{lead.name}</span>
                          {latestDecision?.type === "STATUS_REQUEST_APPROVED" && (
                            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                              Approved
                            </span>
                          )}
                          {latestDecision?.type === "STATUS_REQUEST_REJECTED" && (
                            <span className="rounded-full bg-brand-red/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-brand-red">
                              Rejected
                            </span>
                          )}
                          {!latestDecision && latestRequest && (
                            <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-brand-yellow">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                    <td className="px-3 py-3">{lead.phone}</td>
                    <td className="px-3 py-3">
                      <LeadStatusSelect
                        leadId={lead.id}
                        status={lead.status as LeadStatus}
                        disabled={session.user.role !== "ADMIN"}
                        canRequest={isStaff && isAssigned}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs">{lead.priority}</td>
                    <td className="px-3 py-3 text-xs">
                      <AssignedUserCell user={lead.assignedTo} />
                    </td>
                    <td className="px-3 py-3 text-xs">{formatDateTime(lead.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2 whitespace-nowrap text-xs">
                        {session.user.role === "ADMIN" || isAssigned ? (
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-brand-yellow"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-white/40">View</span>
                        )}
                        {(session.user.role === "ADMIN" || isAssigned) && (
                          <>
                            <Link
                              href={`/admin/leads/${lead.id}#notes`}
                              className="text-white/60"
                            >
                              Add Note
                            </Link>
                            <Link
                              href={`/admin/leads/${lead.id}#followup`}
                              className="text-white/60"
                            >
                              Set Follow-up
                            </Link>
                          </>
                        )}
                        {session.user.role === "ADMIN" && (
                          <Link
                            href={`/admin/leads/${lead.id}#assign`}
                            className="text-white/60"
                          >
                            Assign
                          </Link>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-white/60">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/leads?${new URLSearchParams({
                    ...Object.fromEntries(queryParams),
                    page: String(page - 1)
                  }).toString()}`}
                  className="rounded-full border border-white/20 px-3 py-1"
                >
                  Prev
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/leads?${new URLSearchParams({
                    ...Object.fromEntries(queryParams),
                    page: String(page + 1)
                  }).toString()}`}
                  className="rounded-full border border-white/20 px-3 py-1"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
