"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateGalleryCategoriesAction } from "@/app/admin/gallery/categories/actions";
import { useToast } from "@/components/ui/toast";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Categories"}
    </button>
  );
}

export function GalleryCategoryManager({ initial }: { initial: string[] }) {
  const [state, formAction] = useFormState(updateGalleryCategoriesAction, initialState);
  const toast = useToast();
  const [items, setItems] = useState(
    initial.map((item) => item.trim()).filter(Boolean)
  );
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  useEffect(() => {
    if (state.ok) toast.push({ title: "Categories saved", variant: "success" });
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="categories" value={items.join(", ")} />
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {items.length === 0 ? (
            <span className="text-xs text-white/50">No categories yet.</span>
          ) : (
            items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {editing === item ? (
                  <input
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    onBlur={() => {
                      const next = editingValue.trim();
                      if (!next) {
                        setEditing(null);
                        return;
                      }
                      setItems((prev) =>
                        prev.map((val) => (val === item ? next : val))
                      );
                      setEditing(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        (event.target as HTMLInputElement).blur();
                      }
                      if (event.key === "Escape") {
                        setEditing(null);
                      }
                    }}
                    className="w-28 rounded-lg border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:border-brand-yellow/70 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="text-white/80 hover:text-white"
                    onClick={() => {
                      setEditing(item);
                      setEditingValue(item);
                    }}
                    aria-label={`Edit ${item}`}
                  >
                    {item}
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="text-white/50 hover:text-white"
                    onClick={() =>
                      moveItem(items.indexOf(item), -1)
                    }
                    aria-label={`Move ${item} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-white/50 hover:text-white"
                    onClick={() =>
                      moveItem(items.indexOf(item), 1)
                    }
                    aria-label={`Move ${item} down`}
                  >
                    ↓
                  </button>
                </div>
                <ConfirmActionButton
                  confirmText={`Remove category "${item}"?`}
                  confirmTitle="Remove category"
                  confirmLabel="Remove"
                  onConfirm={() => {
                    setItems((prev) => prev.filter((val) => val !== item));
                  }}
                  className="text-white/50 hover:text-white"
                >
                  ×
                </ConfirmActionButton>
              </span>
            ))
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            placeholder="Add a category"
          />
          <button
            type="button"
            onClick={() => {
              const next = input.trim();
              if (!next) return;
              if (items.includes(next)) return;
              setItems((prev) => [...prev, next]);
              setInput("");
            }}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-white/50">
          These categories appear as gallery albums and in the admin gallery form.
        </p>
      </div>
      <SubmitButton />
    </form>
  );
}
