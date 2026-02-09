import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { UserForm } from "@/components/admin/user-form";
import { deleteUserAction } from "@/app/admin/users/actions";
import { UserCard } from "@/components/admin/user-card";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";
import { UserResetForm } from "@/components/admin/user-reset-form";

export default async function UsersAdminPage() {
  const session = await requireAdminSession();
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white">Create User</h2>
        <div className="mt-4">
          <UserForm />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white">User Accounts</h2>
        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user}>
              <div className="flex flex-wrap items-center gap-3">
                <UserResetForm userId={user.id} />
                {session.user.id !== user.id && (
                  <ConfirmActionForm
                    action={deleteUserAction.bind(null, user.id)}
                    confirmTitle="Move to recycle bin"
                    confirmLabel="Move"
                    confirmText={`Move ${user.name} to the recycle bin?`}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-brand-red/50 px-4 py-2 text-xs text-brand-red"
                    >
                      Move to Recycle Bin
                    </button>
                  </ConfirmActionForm>
                )}
              </div>
            </UserCard>
          ))}
        </div>
      </div>
    </div>
  );
}
