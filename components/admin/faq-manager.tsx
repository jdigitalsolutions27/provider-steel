"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "@/app/admin/content/actions";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

export function FAQManager({
  items
}: {
  items: Array<{ id: string; question: string; answer: string; order: number }>;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(async () => {
            await createFaqAction(formData);
            toast.push({ title: "FAQ added", variant: "success" });
            (event.currentTarget as HTMLFormElement).reset();
          });
        }}
      >
        <h4 className="text-sm font-semibold text-white">Add FAQ</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            name="question"
            placeholder="Question"
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
          <input
            name="order"
            type="number"
            placeholder="Order"
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
          <textarea
            name="answer"
            placeholder="Answer"
            className="md:col-span-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            rows={2}
            required
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-3 rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy"
        >
          Add FAQ
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <form
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              startTransition(async () => {
                await updateFaqAction(item.id, formData);
                toast.push({ title: "FAQ updated", variant: "success" });
              });
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="question"
                defaultValue={item.question}
                className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
                required
              />
              <input
                name="order"
                type="number"
                defaultValue={item.order}
                className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
                required
              />
              <textarea
                name="answer"
                defaultValue={item.answer}
                className="md:col-span-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
                rows={2}
                required
              />
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy"
              >
                Save
              </button>
              <ConfirmActionButton
                confirmText="Delete this FAQ?"
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteFaqAction(item.id);
                    toast.push({ title: "FAQ deleted", variant: "success" });
                  })
                }
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70"
              >
                Delete
              </ConfirmActionButton>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
