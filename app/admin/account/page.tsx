import { requireSession } from "@/lib/guards";
import { AccountForm } from "@/components/admin/account-form";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Account</p>
        <h2 className="text-lg font-semibold text-white">Profile & Security</h2>
      </div>
      <AccountForm
        initialName={session.user.name || ""}
        initialEmail={session.user.email || ""}
        initialAvatarUrl={session.user.avatarUrl}
      />
    </div>
  );
}
