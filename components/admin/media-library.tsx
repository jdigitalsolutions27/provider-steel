"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { createMediaAction, deleteMediaAction } from "@/app/admin/media/actions";
import { ConfirmActionForm } from "@/components/admin/confirm-action-form";
import { parseJsonArray } from "@/lib/utils";
import { FallbackImage } from "@/components/ui/fallback-image";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy"
    >
      {pending ? "Uploading..." : "Add Media"}
    </button>
  );
}

export function MediaLibrary({
  items
}: {
  items: Array<{ id: string; title: string | null; url: string; tags: string | null }>;
}) {
  const [state, formAction] = useFormState(createMediaAction, initialState);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) toast.push({ title: "Media added", variant: "success" });
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="rounded-2xl border border-white/10 bg-white/5 p-6" encType="multipart/form-data">
        <h3 className="text-lg font-semibold text-white">Upload Media</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Title</label>
            <input name="title" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Tags</label>
            <input name="tags" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Upload File</label>
            <input name="file" type="file" accept="image/*" className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Or Image URL</label>
            <input name="url" placeholder="https://..." className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30" />
          </div>
        </div>
        <div className="mt-4">
          <SubmitButton />
        </div>
      </form>

      <div className="grid gap-6 md:grid-cols-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
            No media uploaded yet.
          </div>
        ) : (
          items.map((item) => {
            const tags = parseJsonArray(item.tags);
            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <FallbackImage
                  src={item.url}
                  fallbackSrc="/placeholders/steel-1.svg"
                  alt={item.title || "Media"}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-white">{item.title || "Untitled"}</p>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button
                      className="text-brand-yellow"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.url);
                        toast.push({ title: "URL copied", variant: "success" });
                      }}
                    >
                      Copy URL
                    </button>
                    <ConfirmActionForm
                      action={deleteMediaAction.bind(null, item.id)}
                      confirmText={`Move "${item.title || "this media"}" to the recycle bin?`}
                      confirmTitle="Move to recycle bin"
                      confirmLabel="Move"
                    >
                      <button type="submit" className="text-white/60">
                        Delete
                      </button>
                    </ConfirmActionForm>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

