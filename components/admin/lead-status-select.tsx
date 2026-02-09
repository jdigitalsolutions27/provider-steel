"use client";

import { useState, useTransition } from "react";
import { LeadStatusValues, type LeadStatus } from "@/lib/enums";
import { updateLeadStatus, requestLeadStatusChange } from "@/app/admin/leads/actions";

export function LeadStatusSelect({
  leadId,
  status,
  disabled,
  canRequest
}: {
  leadId: string;
  status: LeadStatus;
  disabled?: boolean;
  canRequest?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [requested, setRequested] = useState<LeadStatus | null>(null);
  const isReadOnly = !!disabled && !canRequest;

  return (
    <div>
      <select
        className={`rounded-lg border px-2.5 py-1.5 text-xs text-white/80 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 ${
          disabled && canRequest
            ? "border-brand-yellow/40 bg-brand-yellow/10"
            : "border-white/20 bg-transparent"
        }`}
        value={status}
        onChange={(event) => {
          if (isReadOnly) return;
          const next = event.target.value as LeadStatus;
          startTransition(() =>
            disabled && canRequest
              ? requestLeadStatusChange(leadId, next).then(() => setRequested(next))
              : updateLeadStatus(leadId, next)
          );
        }}
        disabled={pending || isReadOnly}
        aria-disabled={pending || disabled}
      >
        {LeadStatusValues.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {disabled && canRequest && requested && (
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brand-yellow">
          Requested: {requested}
        </p>
      )}
    </div>
  );
}
