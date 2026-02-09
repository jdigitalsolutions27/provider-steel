"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";

export type ServiceFormState = { ok: boolean; message?: string };

const initialState: ServiceFormState = { ok: false };

const iconOptions = [
  "Truck",
  "Wrench",
  "Factory",
  "Cog",
  "ClipboardList",
  "ShieldCheck",
  "Zap",
  "Ruler",
  "Users",
  "Hammer"
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function ServiceForm({
  action,
  initial
}: {
  action: (prevState: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  initial?: {
    name?: string;
    slug?: string;
    description?: string;
    featured?: boolean;
    iconName?: string | null;
  };
}) {
  const [state, formAction] = useFormState(action, initialState);
  const toast = useToast();
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));

  useEffect(() => {
    if (!slugLocked) setSlug(slugify(name));
  }, [name, slugLocked]);

  useEffect(() => {
    if (state.ok) {
      toast.push({ title: "Service saved", variant: "success" });
      window.location.reload();
    }
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Name</label>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Slug</label>
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugLocked(true);
            }}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={4}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Icon Name</label>
          <input
            name="iconName"
            list="icon-list"
            defaultValue={initial?.iconName || ""}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
          <datalist id="icon-list">
            {iconOptions.map((icon) => (
              <option key={icon} value={icon} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-white/50">Lucide icon name (e.g. Truck, Wrench).</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
          Featured service
        </label>
      </div>
      <SubmitButton label="Save Service" />
    </form>
  );
}
