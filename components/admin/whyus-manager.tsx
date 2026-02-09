"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { createWhyUsAction, updateWhyUsAction, deleteWhyUsAction } from "@/app/admin/content/actions";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

export function WhyUsManager({
  items
}: {
  items: Array<{ id: string; title: string; description: string; iconName: string | null; order: number }>;
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
            await createWhyUsAction(formData);
            toast.push({ title: "Why Us item added", variant: "success" });
            (event.currentTarget as HTMLFormElement).reset();
          });
        }}
      >
        <h4 className="text-sm font-semibold text-white">Add Why Us</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            name="title"
            placeholder="Title"
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
          <input
            name="iconName"
            placeholder="Lucide icon name"
            className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
          <textarea
            name="description"
            placeholder="Description"
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
          Add Item
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
                await updateWhyUsAction(item.id, formData);
                toast.push({ title: "Why Us updated", variant: "success" });
              });
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="title"
                defaultValue={item.title}
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
              <input
                name="iconName"
                defaultValue={item.iconName || ""}
                className="rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
              />
              <textarea
                name="description"
                defaultValue={item.description}
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
                confirmText="Delete this item?"
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteWhyUsAction(item.id);
                    toast.push({ title: "Item deleted", variant: "success" });
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
