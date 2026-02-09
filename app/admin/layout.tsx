import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { ToastProvider } from "@/components/ui/toast";
import { CenterLoader } from "@/components/ui/center-loader";
import {
  purgeOldDeletedAssets,
  purgeOldDeletedLeads,
  purgeOldDeletedUsers,
  purgeOldDeletedProducts,
  purgeOldDeletedTestimonialProjects
} from "@/app/admin/recycle-bin/actions";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    return <div className="min-h-screen bg-brand-navy text-white">{children}</div>;
  }

  if (session.user.role === "ADMIN") {
    await purgeOldDeletedLeads();
    await purgeOldDeletedAssets();
    await purgeOldDeletedUsers();
    await purgeOldDeletedProducts();
    await purgeOldDeletedTestimonialProjects();
  }

  const newLeadsCount = await prisma.lead.count({
    where: { status: "NEW", deletedAt: null }
  });

  return (
    <div className="min-h-screen bg-brand-navy text-white md:grid md:grid-cols-[260px_1fr]">
      <div className="hidden md:block">
        <Sidebar role={session.user.role} newLeadsCount={newLeadsCount} />
      </div>
      <div className="flex min-h-screen flex-col">
        <Topbar
          user={session.user}
          role={session.user.role}
          newLeadsCount={newLeadsCount}
        />
        <ToastProvider>
          <Suspense
            fallback={
              <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
                <CenterLoader
                  title="Loading Dashboard"
                  subtitle="Gathering leads and updates..."
                />
              </div>
            }
          >
            <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
          </Suspense>
        </ToastProvider>
      </div>
    </div>
  );
}
