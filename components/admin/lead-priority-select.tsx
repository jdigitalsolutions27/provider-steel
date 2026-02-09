"use client";

import { useTransition } from "react";
import { LeadPriorityValues, type LeadPriority } from "@/lib/enums";
import { updateLeadPriority } from "@/app/admin/leads/actions";

export function LeadPrioritySelect({
  leadId,
  priority
}: {
  leadId: string;
  priority: LeadPriority;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded-lg border border-white/20 bg-transparent px-2.5 py-1.5 text-xs text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
      value={priority}
      onChange={(event) => {
        const next = event.target.value as LeadPriority;
        startTransition(() => updateLeadPriority(leadId, next));
      }}
      disabled={pending}
    >
      {LeadPriorityValues.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

