import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function MediaPage() {
  await requireAdminSession();
  const items = await prisma.mediaItem.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Media Library</p>
        <h2 className="text-lg font-semibold text-white">Manage images and assets</h2>
      </div>
      <MediaLibrary items={items} />
    </div>
  );
}
