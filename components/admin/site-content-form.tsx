"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { updateSiteContentAction } from "@/app/admin/content/actions";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy"
    >
      {pending ? "Saving..." : "Save Content"}
    </button>
  );
}

export function SiteContentForm({
  initial
}: {
  initial: {
    heroHeading: string;
    heroSubheading: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    aboutIntro: string;
    aboutBody: string;
  };
}) {
  const [state, formAction] = useFormState(updateSiteContentAction, initialState);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) toast.push({ title: "Content updated", variant: "success" });
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Hero Heading</label>
          <input
            name="heroHeading"
            defaultValue={initial.heroHeading}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Hero Subheading</label>
          <input
            name="heroSubheading"
            defaultValue={initial.heroSubheading}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">CTA Primary</label>
          <input
            name="ctaPrimaryText"
            defaultValue={initial.ctaPrimaryText}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">CTA Secondary</label>
          <input
            name="ctaSecondaryText"
            defaultValue={initial.ctaSecondaryText}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">About Intro</label>
        <textarea
          name="aboutIntro"
          defaultValue={initial.aboutIntro}
          rows={2}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">About Body</label>
        <textarea
          name="aboutBody"
          defaultValue={initial.aboutBody}
          rows={5}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <SubmitButton />
    </form>
  );
}

