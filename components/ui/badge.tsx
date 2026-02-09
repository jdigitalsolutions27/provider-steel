import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85",
        className
      )}
      {...props}
    />
  );
}
