"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { updateSiteSettingsAction } from "@/app/admin/settings/actions";

const initialState: { ok: boolean; message?: string } = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-semibold text-brand-navy"
    >
      {pending ? "Saving..." : "Save Settings"}
    </button>
  );
}

export function SiteSettingsForm({
  initial
}: {
  initial: {
    businessName: string;
    taglineMain: string;
    subtitle: string;
    serviceLine: string;
    phone: string;
    email: string;
    address: string;
    messengerUrl?: string | null;
    whatsappUrl?: string | null;
    serviceAreas?: string | string[] | null;
    galleryCategories?: string | string[] | null;
    logoTextSmall: string;
  };
}) {
  const [state, formAction] = useFormState(updateSiteSettingsAction, initialState);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) toast.push({ title: "Settings saved", variant: "success" });
    if (state.message) toast.push({ title: "Error", description: state.message, variant: "error" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Business Name</label>
          <input
            name="businessName"
            defaultValue={initial.businessName}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Logo Text Small</label>
          <input
            name="logoTextSmall"
            defaultValue={initial.logoTextSmall}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Tagline Main</label>
          <input
            name="taglineMain"
            defaultValue={initial.taglineMain}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Subtitle</label>
          <input
            name="subtitle"
            defaultValue={initial.subtitle}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Service Line</label>
        <input
          name="serviceLine"
          defaultValue={initial.serviceLine}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Phone</label>
          <input
            name="phone"
            defaultValue={initial.phone}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={initial.email}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Address</label>
        <input
          name="address"
          defaultValue={initial.address}
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">Messenger URL</label>
          <input
            name="messengerUrl"
            defaultValue={initial.messengerUrl || ""}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">WhatsApp URL</label>
          <input
            name="whatsappUrl"
            defaultValue={initial.whatsappUrl || ""}
            className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">Service Areas</label>
        <input
          name="serviceAreas"
          defaultValue={
            Array.isArray(initial.serviceAreas)
              ? initial.serviceAreas.join(", ")
              : initial.serviceAreas || ""
          }
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Gallery Categories (comma-separated)
        </label>
        <input
          name="galleryCategories"
          defaultValue={
            Array.isArray(initial.galleryCategories)
              ? initial.galleryCategories.join(", ")
              : initial.galleryCategories || ""
          }
          className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white shadow-card/40 focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30"
        />
      </div>
      <SubmitButton />
    </form>
  );
}

