import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { requireSession } from "@/lib/guards";

export default async function AdminOverviewPage() {
  const session = await requireSession();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    newLeadsToday,
    totalLeads,
    leadsByStatus,
    followUps,
    featuredProducts,
    recentLeads
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: startOfDay }, deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { deletedAt: null }
    }),
    prisma.lead.count({
      where: {
        followUpAt: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        deletedAt: null
      }
    }),
    prisma.product.count({ where: { featured: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      where: { deletedAt: null }
    })
  ]);

  let pendingRequests: Array<{
    id: string;
    leadId: string;
    createdAt: Date;
    newValue: string | null;
    lead: { name: string };
    user: { name: string | null } | null;
  }> = [];
  let funnelMap: Record<string, number> = {};
  let recentAuditLogs: Array<{
    id: string;
    createdAt: Date;
    action: string;
    message: string | null;
    actorEmail: string | null;
  }> = [];

  if (session.user.role === "ADMIN") {
    const requests = await prisma.leadEvent.findMany({
      where: { type: "STATUS_REQUESTED" },
      include: { lead: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6
    });

    const leadIds = Array.from(new Set(requests.map((item) => item.leadId)));
    const decisions =
      leadIds.length > 0
        ? await prisma.leadEvent.findMany({
            where: {
              leadId: { in: leadIds },
              type: { in: ["STATUS_REQUEST_APPROVED", "STATUS_REQUEST_REJECTED"] }
            },
            orderBy: { createdAt: "desc" }
          })
        : [];

    pendingRequests = requests.filter(
      (request) =>
        !decisions.some(
          (decision) =>
            decision.leadId === request.leadId &&
            decision.createdAt.getTime() > request.createdAt.getTime()
        )
    );

    const [funnelEvents, auditLogs] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ["name"],
        _count: { name: true },
        where: { createdAt: { gte: startOfWeek } }
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    funnelMap = funnelEvents.reduce<Record<string, number>>((acc, row) => {
      acc[row.name] = row._count.name;
      return acc;
    }, {});

    recentAuditLogs = auditLogs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      action: log.action,
      message: log.message,
      actorEmail: log.actorEmail
    }));
  }

  const statusMap = leadsByStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const statusOrder = ["NEW", "CONTACTED", "QUOTED", "COMPLETED", "LOST"];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="New Leads Today" value={newLeadsToday} accent="red" />
        <StatCard title="Total Leads" value={totalLeads} />
        <StatCard title="Follow-ups (7 days)" value={followUps} accent="blue" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="New" value={statusMap.NEW ?? 0} />
        <StatCard title="Contacted" value={statusMap.CONTACTED ?? 0} />
        <StatCard title="Quoted" value={statusMap.QUOTED ?? 0} />
        <StatCard title="Completed" value={statusMap.COMPLETED ?? 0} />
        <StatCard title="Lost" value={statusMap.LOST ?? 0} />
        <StatCard title="Featured Products" value={featuredProducts} accent="yellow" />
      </div>

      {session.user.role === "ADMIN" && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Page Views (7d)"
            value={funnelMap.page_view ?? 0}
            description="Marketing pages"
            accent="blue"
          />
          <StatCard
            title="Quote CTA Clicks (7d)"
            value={funnelMap.cta_request_quote ?? 0}
            description="Header + hero + CTA band"
            accent="yellow"
          />
          <StatCard
            title="Quote Submits (7d)"
            value={funnelMap.quote_submit ?? 0}
            description="Successful contact requests"
            accent="red"
          />
          <StatCard
            title="Click->Submit Rate"
            value={`${
              (funnelMap.cta_request_quote ?? 0) > 0
                ? Math.round(((funnelMap.quote_submit ?? 0) / (funnelMap.cta_request_quote ?? 0)) * 100)
                : 0
            }%`}
            description="Based on tracked CTA clicks"
            accent="yellow"
          />
        </div>
      )}

      {session.user.role === "ADMIN" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Status Requests</h3>
            <Link href="/admin/leads" className="text-sm text-brand-yellow">
              Review all
            </Link>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-white/60">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{request.lead.name}</p>
                    <p className="text-xs text-white/60">
                      Requested: {request.newValue} - {request.user?.name || "Staff"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-white/60">
                    <p>{formatDateTime(request.createdAt)}</p>
                    <Link
                      href={`/admin/leads/${request.leadId}`}
                      className="text-brand-yellow"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {session.user.role === "ADMIN" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Audit Log</h3>
            <p className="text-xs text-white/60">Latest admin-sensitive actions</p>
          </div>
          {recentAuditLogs.length === 0 ? (
            <p className="text-sm text-white/60">No audit logs yet.</p>
          ) : (
            <div className="space-y-2">
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/70"
                >
                  <p className="font-semibold text-white">{log.action}</p>
                  <p>{log.message || "No additional detail."}</p>
                  <p className="text-white/50">
                    {log.actorEmail || "System"} - {formatDateTime(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <h3 className="text-lg font-semibold text-white">Leads by Status</h3>
        <div className="mt-4 space-y-3">
          {statusOrder.map((status) => {
            const count = statusMap[status] ?? 0;
            const width = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3 text-xs text-white/70">
                <span className="w-20 font-semibold text-white">{status}</span>
                <div className="h-2 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-brand-yellow"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm text-brand-yellow">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentLeads.length === 0 ? (
            <p className="text-sm text-white/60">No leads yet.</p>
          ) : (
            recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-white/60">{lead.phone}</p>
                </div>
                <div className="text-right text-xs text-white/60">
                  <p>{lead.status}</p>
                  <p>{formatDateTime(lead.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
