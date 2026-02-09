"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { parseJsonArray, slugify } from "@/lib/utils";

export type TestimonialFormState = {
  ok: boolean;
  message?: string;
};

const initialState: TestimonialFormState = { ok: false };

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

export function TestimonialForm({
  action,
  initial
}: {
  action: (prevState: TestimonialFormState, formData: FormData) => Promise<TestimonialFormState>;
  initial?: {
    title?: string;
    slug?: string;
    details?: string;
    status?: "ONGOING" | "COMPLETED";
    statusNote?: string | null;
    imageUrl?: string | null;
    imageUrls?: string;
    location?: string | null;
    completedAt?: string;
    sortOrder?: number;
  };
}) {
  const [state, formAction] = useFormState(action, initialState);
  const safeState = state ?? initialState;
  const toast = useToast();
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));
  const [status, setStatus] = useState<"ONGOING" | "COMPLETED">(initial?.status || "ONGOING");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [imageUrls, setImageUrls] = useState(initial?.imageUrls || "");
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slugLocked) setSlug(slugify(title));
  }, [title, slugLocked]);

  useEffect(() => {
    if (safeState.ok) {
      toast.push({
        title: "Project saved",
        description: "Redirecting to testimonials dashboard...",
        variant: "success"
      });
      reloadTimerRef.current = setTimeout(() => {
        router.push("/admin/testimonials?saved=1");
      }, 700);
      return;
    }
    if (safeState.message) {
      toast.push({ title: "Error", description: safeState.message, variant: "error" });
    }
  }, [safeState, toast, router]);

  useEffect(() => {
    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, []);

  const previewImages = useMemo(
    () => Array.from(new Set([imageUrl, ...parseJsonArray(imageUrls)].filter(Boolean))),
    [imageUrl, imageUrls]
  );

  return (
    <form action={formAction} className="space-y-4" encType="multipart/form-data">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Project Name</label>
          <input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Project Details</label>
        <textarea
          name="details"
          defaultValue={initial?.details || ""}
          rows={4}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Status</label>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "ONGOING" | "COMPLETED")}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          >
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Sort Order</label>
          <input
            name="sortOrder"
            defaultValue={String(initial?.sortOrder ?? 0)}
            type="number"
            min={0}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Status Note</label>
          <input
            name="statusNote"
            defaultValue={initial?.statusNote || ""}
            placeholder={status === "ONGOING" ? "e.g. Frame erection at 65%" : "e.g. Finished Q4 2025"}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Location</label>
          <input
            name="location"
            defaultValue={initial?.location || ""}
            placeholder="Project site / city"
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>

      {status === "COMPLETED" && (
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Completed Date</label>
          <input
            name="completedAt"
            type="date"
            defaultValue={initial?.completedAt || ""}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Cover Image URL</label>
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Upload Cover Image</label>
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
          Additional Images (URLs, comma or new line)
        </label>
        <textarea
          name="imageUrls"
          value={imageUrls}
          onChange={(event) => setImageUrls(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          placeholder="https://... , https://..."
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Upload Multiple Images</label>
        <input
          name="imageFiles"
          type="file"
          accept="image/*"
          multiple
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>

      {previewImages.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preview</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {previewImages.map((src, index) => (
              <div key={`${src}-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <SubmitButton label="Save Project" />
    </form>
  );
}
