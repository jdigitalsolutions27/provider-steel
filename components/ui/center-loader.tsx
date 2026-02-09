"use client";

import { Wrench } from "lucide-react";

export function CenterLoader({
  title = "Loading",
  subtitle = "Preparing your project details..."
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-brand-yellow/30 border-t-brand-red animate-spin" />
        <div className="absolute inset-2 rounded-full border border-white/10 bg-white/5 shadow-soft" />
        <Wrench className="absolute inset-0 m-auto h-9 w-9 text-brand-yellow animate-pulse" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{title}</p>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      </div>
    </div>
  );
}
