import type { WhyUsItem } from "@prisma/client";
import { getIconByName } from "@/lib/icons";

export function WhyUsCard({ item }: { item: WhyUsItem }) {
  const Icon = getIconByName(item.iconName ?? undefined);

  return (
    <div className="group relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-yellow/40 via-white/20 to-brand-red/40 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Icon className="h-5 w-5 text-brand-yellow" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
      <p className="mt-2 text-sm text-white/70">{item.description}</p>
    </div>
  );
}
