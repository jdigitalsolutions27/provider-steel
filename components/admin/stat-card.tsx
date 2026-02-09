import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  description,
  accent = "yellow"
}: {
  title: string;
  value: string | number;
  description?: string;
  accent?: "yellow" | "red" | "blue";
}) {
  const accentClass =
    accent === "red"
      ? "border-brand-red/50"
      : accent === "blue"
      ? "border-white/30"
      : "border-brand-yellow/60";

  return (
    <div className={cn("rounded-3xl border bg-white/5 p-6 shadow-card", accentClass)}>
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {description && <p className="mt-2 text-xs text-white/60">{description}</p>}
    </div>
  );
}
