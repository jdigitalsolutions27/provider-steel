"use client";

import { useTransition } from "react";
import { updateLeadFollowUp } from "@/app/admin/leads/actions";

export function LeadFollowUpInput({
  leadId,
  followUpAt
}: {
  leadId: string;
  followUpAt?: Date | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="date"
      className="rounded-lg border border-white/20 bg-transparent px-2.5 py-1.5 text-xs text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
      defaultValue={followUpAt ? followUpAt.toISOString().split("T")[0] : ""}
      onChange={(event) => {
        const value = event.target.value;
        startTransition(() => updateLeadFollowUp(leadId, value || undefined));
      }}
      disabled={pending}
    />
  );
}

