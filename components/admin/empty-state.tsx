export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs text-white/60">{description}</p>
    </div>
  );
}
