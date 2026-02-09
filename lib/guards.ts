import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerAuthSession();
  if (!session) redirect("/admin/login");
  if (session.user?.forceLogout) {
    const reason = session.user.forceLogoutReason || "reset";
    redirect(`/admin/login?reason=${reason}`);
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/admin");
  return session;
}

export async function assertAuthenticated() {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function assertAdmin() {
  const session = await assertAuthenticated();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
