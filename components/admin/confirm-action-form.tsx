"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type ConfirmActionFormProps = {
  action: (formData: FormData) => unknown | Promise<unknown>;
  confirmText?: string;
  confirmTitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  stopPropagation?: boolean;
  children: ReactNode;
};

export function ConfirmActionForm({
  action,
  confirmText = "Are you sure you want to delete this?",
  confirmTitle = "Confirm deletion",
  confirmLabel = "Yes, delete",
  cancelLabel = "Cancel",
  className,
  stopPropagation,
  children
}: ConfirmActionFormProps) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const runAction = async (formData: FormData) => {
    await action(formData);
  };

  return (
    <>
      <form
        ref={formRef}
        action={runAction}
        className={className}
        onSubmit={(event) => {
          if (stopPropagation) event.stopPropagation();
          if (confirmed) {
            setConfirmed(false);
            return;
          }
          event.preventDefault();
          setOpen(true);
        }}
        onClick={
          stopPropagation
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
      >
        {children}
      </form>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        description={confirmText}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          setConfirmed(true);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
