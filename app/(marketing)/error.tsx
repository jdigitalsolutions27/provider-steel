"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function MarketingError({
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
    <div className="page-shell">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-card">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Page Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">We could not load this page</h1>
        <p className="mt-3 text-sm text-white/70">
          Please retry. You can also return to the homepage.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

