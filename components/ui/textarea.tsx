import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/20 bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder:text-white/38 shadow-card/40 transition duration-200 ease-out focus:border-brand-yellow/70 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30",
        className
      )}
      {...props}
    />
  );
}
