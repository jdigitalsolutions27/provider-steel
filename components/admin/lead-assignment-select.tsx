"use client";

import { useTransition } from "react";
import { updateLeadAssignment } from "@/app/admin/leads/actions";

export function LeadAssignmentSelect({
  leadId,
  users,
  assignedTo
}: {
  leadId: string;
  users: Array<{ id: string; name: string }>;
  assignedTo?: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded-lg border border-white/20 bg-transparent px-2.5 py-1.5 text-xs text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
      value={assignedTo || ""}
      onChange={(event) => {
        const value = event.target.value;
        startTransition(() => updateLeadAssignment(leadId, value || undefined));
      }}
      disabled={pending}
    >
      <option value="">Unassigned</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}

