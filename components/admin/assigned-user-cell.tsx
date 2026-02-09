"use client";

type AssignedUserCellProps = {
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
};

export function AssignedUserCell({ user }: AssignedUserCellProps) {
  if (!user) {
    return <span>Unassigned</span>;
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || "?";
  const dialogId = `avatar-${user.id}`;

  return (
    <div className="flex items-center gap-2">
      {user.avatarUrl ? (
        <>
          <button
            type="button"
            onClick={() => {
              const modal = document.getElementById(dialogId) as HTMLDialogElement | null;
              modal?.showModal();
            }}
            className="h-6 w-6 overflow-hidden rounded-full border border-white/10"
            aria-label="View profile photo"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </button>
          <dialog
            id={dialogId}
            className="rounded-2xl border border-white/10 bg-brand-navy/95 p-4 text-white"
          >
            <div className="max-w-md">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="max-h-[70vh] w-full rounded-xl object-contain"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70"
                  onClick={(event) => {
                    const dialog = event.currentTarget.closest(
                      "dialog"
                    ) as HTMLDialogElement | null;
                    dialog?.close();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-semibold text-white/70">
          {initials}
        </div>
      )}
      <span>{user.name}</span>
    </div>
  );
}
