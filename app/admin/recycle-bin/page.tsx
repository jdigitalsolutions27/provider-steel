import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { requireAdminSession } from "@/lib/guards";
import {
  purgeLead,
  purgeOldDeletedAssets,
  purgeOldDeletedLeads,
  purgeOldDeletedProducts,
  purgeOldDeletedTestimonialProjects,
  purgeOldDeletedUsers,
  purgeGalleryItem,
  purgeSelectedGalleryItems,
  purgeSelectedLeads,
  purgeMediaItem,
  purgeProduct,
  purgeSelectedMediaItems,
  purgeSelectedProducts,
  purgeSelectedTestimonialProjects,
  purgeSelectedUsers,
  purgeTestimonialProject,
  purgeUser,
  restoreGalleryItem,
  restoreLead,
  restoreMediaItem,
  restoreProduct,
  restoreTestimonialProject,
  restoreUser
} from "./actions";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";
import { FallbackImage } from "@/components/ui/fallback-image";

const DAY_MS = 24 * 60 * 60 * 1000;

function getDaysRemaining(deletedAt: Date) {
  const diff = Date.now() - deletedAt.getTime();
  const daysPassed = Math.floor(diff / DAY_MS);
  const remaining = 15 - daysPassed;
  return remaining > 0 ? remaining : 0;
}

type BulkDeleteControlProps = {
  action: (formData: FormData) => Promise<void>;
  label: string;
  confirmText: string;
};

function BulkDeleteControl({ action, label, confirmText }: BulkDeleteControlProps) {
  return (
    <ConfirmActionForm
      action={action}
      confirmTitle="Delete selected records"
      confirmLabel="Delete selected"
      confirmText={confirmText}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-3 py-2"
    >
      <label className="inline-flex items-center gap-2 text-xs text-white/80">
        <input
          type="checkbox"
          name="selectAll"
          required
          className="h-4 w-4 rounded border-white/30 bg-transparent text-brand-red focus:ring-brand-red/40"
        />
        {label}
      </label>
      <button
        type="submit"
        className="rounded-full border border-brand-red/60 px-3 py-1 text-xs font-semibold text-brand-red"
      >
        Delete selected
      </button>
    </ConfirmActionForm>
  );
}

export default async function RecycleBinPage() {
  await requireAdminSession();
  await purgeOldDeletedLeads();
  await purgeOldDeletedAssets();
  await purgeOldDeletedUsers();
  await purgeOldDeletedProducts();
  await purgeOldDeletedTestimonialProjects();

  const leads = await prisma.lead.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const galleryItems = await prisma.galleryItem.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const mediaItems = await prisma.mediaItem.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const products = await prisma.product.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const testimonialProjects = await prisma.testimonialProject.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" }
  });

  const getGalleryCategory = (tagsValue?: string | null) => {
    try {
      const tags = JSON.parse(tagsValue || "[]") as string[];
      const categoryTag = tags.find((tag) => tag.startsWith("Category:"));
      return categoryTag ? categoryTag.replace("Category:", "") : "GENERAL";
    } catch {
      return "GENERAL";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Recycle Bin</h2>
        <p className="mt-2 text-sm text-white/60">
          Deleted records stay here for 15 days, then are removed permanently.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Leads
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {leads.length} items
          </span>
        </div>
        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted leads yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <BulkDeleteControl
              action={purgeSelectedLeads}
              label="Select all deleted leads"
              confirmText="Delete all deleted leads in this section forever? This cannot be undone."
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm text-white/70">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.3em] text-white/50">
                  <th className="py-2">Lead</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Deleted</th>
                  <th className="py-2">Remaining</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10">
                    <td className="py-3 font-semibold text-white">{lead.name}</td>
                    <td className="py-3">{lead.phone}</td>
                    <td className="py-3 text-xs">{lead.status}</td>
                    <td className="py-3 text-xs">
                      {lead.deletedAt ? formatDateTime(lead.deletedAt) : "-"}
                    </td>
                    <td className="py-3 text-xs">
                      {lead.deletedAt ? `${getDaysRemaining(lead.deletedAt)} days` : "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2 whitespace-nowrap text-xs">
                        <form action={restoreLead.bind(null, lead.id)}>
                          <button
                            type="submit"
                            className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                          >
                            Restore
                          </button>
                        </form>
                        <ConfirmActionForm
                          action={purgeLead.bind(null, lead.id)}
                          confirmText={`Delete ${lead.name} forever? This cannot be undone.`}
                          confirmTitle="Delete permanently"
                          confirmLabel="Delete forever"
                        >
                          <button
                            type="submit"
                            className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                          >
                            Delete Forever
                          </button>
                        </ConfirmActionForm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Testimonial Projects
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {testimonialProjects.length} items
          </span>
        </div>
        {testimonialProjects.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted testimonial projects.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <BulkDeleteControl
              action={purgeSelectedTestimonialProjects}
              label="Select all deleted testimonial projects"
              confirmText="Delete all deleted testimonial projects forever? This cannot be undone."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {testimonialProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <FallbackImage
                        src={project.imageUrl}
                        fallbackSrc="/placeholders/steel-1.svg"
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{project.title}</p>
                      <p className="text-xs text-white/60">{project.status}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60">
                    Deleted {project.deletedAt ? formatDateTime(project.deletedAt) : "-"} {" - "}
                    {project.deletedAt ? `${getDaysRemaining(project.deletedAt)} days left` : "-"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <form action={restoreTestimonialProject.bind(null, project.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                      >
                        Restore
                      </button>
                    </form>
                    <ConfirmActionForm
                      action={purgeTestimonialProject.bind(null, project.id)}
                      confirmTitle="Delete project"
                      confirmLabel="Delete forever"
                      confirmText={`Delete ${project.title} forever? This cannot be undone.`}
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                      >
                        Delete Forever
                      </button>
                    </ConfirmActionForm>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Gallery Items
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {galleryItems.length} items
          </span>
        </div>
        {galleryItems.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted gallery items.</p>
        ) : (
          <>
            <BulkDeleteControl
              action={purgeSelectedGalleryItems}
              label="Select all deleted gallery items"
              confirmText="Delete all deleted gallery items forever? This cannot be undone."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[16/10] bg-white/5">
                  <FallbackImage
                    src={item.imageUrl}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {getGalleryCategory(item.tags)}
                    </p>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                  </div>
                  <p className="text-xs text-white/60">
                    Deleted {item.deletedAt ? formatDateTime(item.deletedAt) : "-"} {" - "}
                    {item.deletedAt ? `${getDaysRemaining(item.deletedAt)} days left` : "-"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <form action={restoreGalleryItem.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                      >
                        Restore
                      </button>
                    </form>
                    <ConfirmActionForm
                      action={purgeGalleryItem.bind(null, item.id)}
                      confirmText={`Delete ${item.title} forever? This cannot be undone.`}
                      confirmTitle="Delete permanently"
                      confirmLabel="Delete forever"
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                      >
                        Delete Forever
                      </button>
                    </ConfirmActionForm>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Media Files
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {mediaItems.length} items
          </span>
        </div>
        {mediaItems.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted media files.</p>
        ) : (
          <>
            <BulkDeleteControl
              action={purgeSelectedMediaItems}
              label="Select all deleted media files"
              confirmText="Delete all deleted media files forever? This cannot be undone."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[16/10] bg-white/5">
                  <FallbackImage
                    src={item.url}
                    fallbackSrc="/placeholders/steel-1.svg"
                    alt={item.title || "Media"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Media</p>
                    <p className="text-sm font-semibold text-white">{item.title || "Untitled"}</p>
                  </div>
                  <p className="text-xs text-white/60">
                    Deleted {item.deletedAt ? formatDateTime(item.deletedAt) : "-"} {" - "}
                    {item.deletedAt ? `${getDaysRemaining(item.deletedAt)} days left` : "-"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <form action={restoreMediaItem.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                      >
                        Restore
                      </button>
                    </form>
                    <ConfirmActionForm
                      action={purgeMediaItem.bind(null, item.id)}
                      confirmText={`Delete ${item.title || "media"} forever? This cannot be undone.`}
                      confirmTitle="Delete permanently"
                      confirmLabel="Delete forever"
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                      >
                        Delete Forever
                      </button>
                    </ConfirmActionForm>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Products
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {products.length} items
          </span>
        </div>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted products.</p>
        ) : (
          <>
            <BulkDeleteControl
              action={purgeSelectedProducts}
              label="Select all deleted products"
              confirmText="Delete all deleted products forever? This cannot be undone."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-white/60">{product.category}</p>
                    <p className="text-xs text-white/60">{product.slug}</p>
                  </div>
                </div>
                <p className="text-xs text-white/60">
                  Deleted {product.deletedAt ? formatDateTime(product.deletedAt) : "-"} {" - "}
                  {product.deletedAt ? `${getDaysRemaining(product.deletedAt)} days left` : "-"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <form action={restoreProduct.bind(null, product.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                    >
                      Restore
                    </button>
                  </form>
                  <ConfirmActionForm
                    action={purgeProduct.bind(null, product.id)}
                    confirmTitle="Delete product"
                    confirmLabel="Delete forever"
                    confirmText={`Delete ${product.name} forever? This cannot be undone.`}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                    >
                      Delete Forever
                    </button>
                  </ConfirmActionForm>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Deleted Users
          </h3>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {users.length} items
          </span>
        </div>
        {users.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No deleted users.</p>
        ) : (
          <>
            <BulkDeleteControl
              action={purgeSelectedUsers}
              label="Select all deleted users"
              confirmText="Delete all deleted users forever? This cannot be undone."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    {user.avatarUrl ? (
                      <FallbackImage
                        src={user.avatarUrl}
                        fallbackSrc="/placeholders/steel-1.svg"
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                        {user.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-white/60">{user.email}</p>
                    <p className="text-xs text-white/60">{user.role}</p>
                  </div>
                </div>
                <p className="text-xs text-white/60">
                  Deleted {user.deletedAt ? formatDateTime(user.deletedAt) : "-"} {" - "}
                  {user.deletedAt ? `${getDaysRemaining(user.deletedAt)} days left` : "-"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <form action={restoreUser.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                    >
                      Restore
                    </button>
                  </form>
                  <ConfirmActionForm
                    action={purgeUser.bind(null, user.id)}
                    confirmTitle="Delete user"
                    confirmLabel="Delete forever"
                    confirmText={`Delete ${user.name} forever? This cannot be undone.`}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-brand-red/50 px-3 py-1 text-brand-red"
                    >
                      Delete Forever
                    </button>
                  </ConfirmActionForm>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

