"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-card">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Admin Error</p>
      <h2 className="mt-2 text-xl font-semibold text-white">Failed to load this dashboard page</h2>
      <p className="mt-2 text-sm text-white/70">
        Try again. If this keeps happening, refresh the page or sign in again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
}

