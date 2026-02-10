"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { parseJsonArray, slugify } from "@/lib/utils";
import { ProductCategoryValues } from "@/lib/enums";
import { FallbackImage } from "@/components/ui/fallback-image";
import { upload } from "@vercel/blob/client";

const categoryLabels: Record<string, string> = {
  ROOFING: "Roofing",
  ROLLUP_DOORS: "Roll-Up Doors",
  CEE_PURLINS: "Cee Purlins",
  ACCESSORIES: "Accessories",
  COILS_ZINC: "Coils & Zinc"
};

export type ProductFormState = {
  ok: boolean;
  message?: string;
};

const initialState: ProductFormState = { ok: false };

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

export function ProductForm({
  action,
  initial,
  categories
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial?: {
    name?: string;
    slug?: string;
    category?: string;
    shortDescription?: string;
    specs?: string;
    colors?: string;
    featured?: boolean;
    imageUrl?: string | null;
    imageUrls?: string;
  };
  categories?: string[];
}) {
  const [state, formAction] = useFormState(action, initialState);
  const toast = useToast();

  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [imageUrls, setImageUrls] = useState(initial?.imageUrls || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [multiUploading, setMultiUploading] = useState(false);
  const [multiProgress, setMultiProgress] = useState<{ done: number; total: number } | null>(
    null
  );

  const categoryOptions: string[] =
    categories && categories.length ? [...categories] : [...ProductCategoryValues];

  const previewImages = [
    imageUrl,
    ...parseJsonArray(imageUrls)
  ].filter(Boolean);

  useEffect(() => {
    if (!slugLocked) setSlug(slugify(name));
  }, [name, slugLocked]);

  useEffect(() => {
    if (state.ok) {
      toast.push({ title: "Product saved", variant: "success" });
      window.location.reload();
    } else if (state.message) {
      toast.push({ title: "Error", description: state.message, variant: "error" });
    }
  }, [state, toast]);

  function safeName(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  function inferExt(file: File) {
    const byType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };
    if (byType[file.type]) return byType[file.type];
    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    return ext && ext.length <= 5 ? ext : "jpg";
  }

  async function tryUploadToBlob(file: File, kind: "cover" | "gallery") {
    const pathname = `uploads/${Date.now()}-${kind}-${safeName(file.name) || "image"}.${inferExt(
      file
    )}`;

    return upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      contentType: file.type || undefined
    });
  }

  return (
    <form action={formAction} className="space-y-4" encType="multipart/form-data">
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
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Category</label>
        <select
          name="category"
          defaultValue={initial?.category || categoryOptions[0] || "ROOFING"}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        >
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {categoryLabels[item] || item}
            </option>
          ))}
          {initial?.category && !categoryOptions.includes(initial.category) && (
            <option value={initial.category}>{initial.category}</option>
          )}
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          defaultValue={initial?.shortDescription}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Specs (JSON or text)</label>
          <textarea
            name="specs"
            defaultValue={initial?.specs}
            rows={4}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Colors (comma-separated)</label>
          <textarea
            name="colors"
            defaultValue={initial?.colors}
            rows={4}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
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
            disabled={coverUploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const isLocal =
                typeof window !== "undefined" &&
                (window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1" ||
                  window.location.hostname.endsWith(".local"));

              // For small/quick uploads, go direct-to-Blob when available.
              // If this fails (e.g. no blob token locally), user can still Save
              // and the server action will handle local /public/uploads.
              setCoverUploading(true);
              try {
                if (file.size > 5 * 1024 * 1024) {
                  toast.push({
                    title: "File too large",
                    description: "Max 5MB per image.",
                    variant: "error"
                  });
                  return;
                }

                const blob = await tryUploadToBlob(file, "cover");
                setImageUrl(blob.url);

                toast.push({ title: "Cover image uploaded", variant: "success" });

                // Prevent sending the file binary to the Server Action.
                event.target.value = "";
              } catch (error: any) {
                toast.push({
                  title: "Upload failed",
                  description: String(error?.message || error),
                  variant: "error"
                });
                // On deployed environments, don't risk submitting large file payloads.
                if (!isLocal) event.target.value = "";
              } finally {
                setCoverUploading(false);
              }
            }}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
          {coverUploading && (
            <p className="mt-2 text-xs text-white/60">Uploading cover image...</p>
          )}
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Gallery Images (URLs, comma or new line)
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
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Upload Multiple Images
        </label>
        <input
          name="imageFiles"
          type="file"
          accept="image/*"
          multiple
          disabled={multiUploading}
          onChange={async (event) => {
            const files = Array.from(event.target.files || []).filter((f) => f.size > 0);
            if (!files.length) return;

            const isLocal =
              typeof window !== "undefined" &&
              (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1" ||
                window.location.hostname.endsWith(".local"));

            // Guardrails: keep UX predictable and avoid accidental huge batches.
            if (files.length > 25) {
              toast.push({
                title: "Too many files",
                description: "Please upload up to 25 images at a time.",
                variant: "error"
              });
              return;
            }

            setMultiUploading(true);
            setMultiProgress({ done: 0, total: files.length });

            try {
              const uploaded: string[] = [];

              // Upload sequentially for stability (avoids spiking network & API).
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) {
                  toast.push({
                    title: "Skipped large file",
                    description: `${file.name} exceeds 5MB.`,
                    variant: "error"
                  });
                  setMultiProgress({ done: i + 1, total: files.length });
                  continue;
                }

                const blob = await tryUploadToBlob(file, "gallery");
                uploaded.push(blob.url);
                setMultiProgress({ done: i + 1, total: files.length });
              }

              if (uploaded.length) {
                setImageUrls((prev) => {
                  const existing = parseJsonArray(prev);
                  const merged = Array.from(new Set([...existing, ...uploaded]));
                  return JSON.stringify(merged);
                });

                if (!imageUrl) setImageUrl(uploaded[0]);

                toast.push({
                  title: "Images uploaded",
                  description: `${uploaded.length} image(s) added to the gallery list.`,
                  variant: "success"
                });

                // Prevent sending the file binaries to the Server Action.
                event.target.value = "";
              } else {
                toast.push({
                  title: "No images uploaded",
                  description: "Please check file types and sizes (max 5MB each).",
                  variant: "error"
                });
              }
            } catch (error: any) {
              toast.push({
                title: "Upload failed",
                description: String(error?.message || error),
                variant: "error"
              });
              // On deployed environments, don't risk submitting large file payloads.
              if (!isLocal) event.target.value = "";
            } finally {
              setMultiUploading(false);
              setMultiProgress(null);
            }
          }}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
        {multiProgress && (
          <p className="mt-2 text-xs text-white/60">
            Uploading {multiProgress.done}/{multiProgress.total}...
          </p>
        )}
      </div>
      {previewImages.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preview</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {previewImages.map((src) => (
              <div key={src} className="overflow-hidden rounded-xl border border-white/10">
                <FallbackImage
                  src={src}
                  fallbackSrc="/placeholders/steel-1.svg"
                  alt="Preview"
                  className="h-24 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initial?.featured}
          className="h-4 w-4 rounded border-white/20 bg-white/10"
        />
        Featured product
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={coverUploading || multiUploading}
          className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Product
        </button>
        {(coverUploading || multiUploading) && (
          <span className="text-xs text-white/60">Finish uploads before saving.</span>
        )}
      </div>
    </form>
  );
}
