"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createLeadAction, type LeadFormState } from "@/app/(marketing)/contact/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const initialState: LeadFormState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-track="cta_submit_quote"
      data-track-label="contact_submit_request"
      className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-60"
    >
      {pending ? "Sending..." : "Submit Request"}
    </button>
  );
}

export function ContactForm({
  products,
  services,
  defaultProductSlug,
  defaultServiceSlug
}: {
  products: Array<{ id: string; name: string; slug: string }>;
  services: Array<{ id: string; name: string; slug: string }>;
  defaultProductSlug?: string;
  defaultServiceSlug?: string;
}) {
  const [state, formAction] = useFormState(createLeadAction, initialState);
  const [preferredContact, setPreferredContact] = useState("CALL");
  const [showSuccess, setShowSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);

  const defaultProduct = products.find((p) => p.slug === defaultProductSlug);
  const defaultService = services.find((s) => s.slug === defaultServiceSlug);

  const contactLabel = useMemo(() => {
    switch (preferredContact) {
      case "MESSENGER":
        return "Messenger Link";
      case "WHATSAPP":
        return "WhatsApp Link/Number";
      case "EMAIL":
        return "Email Address";
      case "TEXT":
        return "Text/SMS Number";
      default:
        return "Contact Link/Handle";
    }
  }, [preferredContact]);

  const contactPlaceholder = useMemo(() => {
    switch (preferredContact) {
      case "MESSENGER":
        return "https://m.me/username";
      case "WHATSAPP":
        return "https://wa.me/63XXXXXXXXXX";
      case "EMAIL":
        return "your@email.com";
      case "TEXT":
        return "+63 9xx xxx xxxx";
      default:
        return "Paste your contact link or handle";
    }
  }, [preferredContact]);

  useEffect(() => {
    if (!state.ok) return;
    setShowSuccess(true);
    setSecondsLeft(5);

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const reload = window.setTimeout(() => {
      window.location.reload();
    }, 5000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(reload);
    };
  }, [state.ok]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-white">Request a Quote</h2>
      <p className="mt-2 text-sm text-white/70">
        Share your requirements and we will respond quickly.
      </p>
      <form action={formAction} className="mt-6 space-y-5" encType="multipart/form-data">
        <input
          type="text"
          name="company"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Name
            </label>
            <Input name="name" required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Phone
            </label>
            <Input name="phone" required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Email
            </label>
            <Input name="email" type="email" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Location
            </label>
            <Input name="location" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Inquiry Type
            </label>
            <Select name="inquiryType" defaultValue="PRODUCT">
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
              <option value="GENERAL">General</option>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Preferred Contact
            </label>
            <Select
              name="preferredContact"
              defaultValue="CALL"
              onChange={(event) => setPreferredContact(event.target.value)}
            >
              <option value="CALL">Call</option>
              <option value="TEXT">Text</option>
              <option value="MESSENGER">Messenger</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">
            {contactLabel} (optional)
          </label>
          <Input name="contactLink" placeholder={contactPlaceholder} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Product (optional)
            </label>
            <Select name="productId" defaultValue={defaultProduct?.id ?? ""}>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Service (optional)
            </label>
            <Select name="serviceId" defaultValue={defaultService?.id ?? ""}>
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">
            Quantity / Size / Specs
          </label>
          <Textarea name="message" rows={4} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Attach Photo (optional)
            </label>
            <Input name="attachment" type="file" accept="image/*" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              Attachment URL (optional)
            </label>
            <Input name="attachmentUrl" placeholder="https://..." />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            name="confirm"
            required
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
          I confirm the details are correct.
        </label>
        <SubmitButton />
      </form>
      {state.message && (
        <p className="mt-4 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-sm text-brand-yellow">
          {state.message}
        </p>
      )}
      {state.ok && (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
          Request received. Our team will reach out shortly.
        </p>
      )}
      {state.ok && state.preview && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Message Preview
          </p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-white/70">
            {state.preview}
          </pre>
        </div>
      )}
      {showSuccess && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80 shadow-soft">
          Thank you! Your request was sent. Refreshing in {secondsLeft}s...
        </div>
      )}
    </div>
  );
}
