"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type ConfirmActionButtonProps = {
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  confirmTitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  stopPropagation?: boolean;
  children: ReactNode;
};

export function ConfirmActionButton({
  onConfirm,
  confirmText = "Are you sure you want to delete this?",
  confirmTitle = "Confirm deletion",
  confirmLabel = "Yes, delete",
  cancelLabel = "Cancel",
  className,
  stopPropagation,
  children
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={(event) => {
          if (stopPropagation) event.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmText}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          void onConfirm();
        }}
      />
    </>
  );
}
