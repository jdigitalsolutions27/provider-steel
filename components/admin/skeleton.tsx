import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 w-full rounded-full bg-white/10 shimmer", className)} />
  );
}
