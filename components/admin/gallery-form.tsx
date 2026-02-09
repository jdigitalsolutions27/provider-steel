"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { ProductCategoryValues } from "@/lib/enums";

export type GalleryFormState = { ok: boolean; message?: string };

const initialState: GalleryFormState = { ok: false };

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

export function GalleryForm({
  action,
  initial,
  categories
}: {
  action: (prevState: GalleryFormState, formData: FormData) => Promise<GalleryFormState>;
  initial?: {
    title?: string;
    description?: string | null;
    imageUrl?: string;
    tags?: string;
    category?: string;
    featured?: boolean;
  };
  categories?: string[];
}) {
  const [state, formAction] = useFormState(action, initialState);
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");

  useEffect(() => {
    if (state.ok) {
      toast.push({ title: "Gallery saved", variant: "success" });
      window.location.reload();
    }
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4" encType="multipart/form-data">
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Title</label>
        <input
          name="title"
          defaultValue={initial?.title}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          required
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Description</label>
        <textarea
          name="description"
          defaultValue={initial?.description || ""}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Image URL</label>
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Upload Image</label>
          <input
            name="imageFile"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Upload Multiple Images
        </label>
        <input
          name="imageFiles"
          type="file"
          accept="image/*"
          multiple
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Category</label>
        <select
          name="category"
          defaultValue={initial?.category || ""}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        >
          <option value="">General</option>
          {(categories?.length ? categories : ProductCategoryValues).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-white/50">
          Used to group gallery items into albums.
        </p>
      </div>
      {imageUrl && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Preview" className="mt-3 h-40 w-full rounded-xl object-cover" />
        </div>
      )}
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Tags (comma-separated)</label>
        <input
          name="tags"
          defaultValue={initial?.tags}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={!!initial?.featured}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-brand-yellow focus:ring-brand-yellow/40"
        />
        Feature this in homepage gallery section
      </label>
      <SubmitButton label="Save Gallery Item" />
    </form>
  );
}
