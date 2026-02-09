import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-white/20 bg-white/[0.02] px-4 py-2.5 text-sm text-white shadow-card/40 transition duration-200 ease-out focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
