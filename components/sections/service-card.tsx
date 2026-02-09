import type { Service } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getIconByName } from "@/lib/icons";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = getIconByName(service.iconName ?? undefined);

  return (
    <article className="group relative flex min-h-[220px] flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-yellow/40 via-white/20 to-brand-red/40 opacity-60 transition duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-red/10 blur-2xl transition duration-300 group-hover:bg-brand-red/20" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-brand-yellow/10 blur-2xl transition duration-300 group-hover:bg-brand-yellow/20" />
      <div className="relative flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-brand-navy/70 shadow-card">
          <Icon className="h-5 w-5 text-brand-yellow transition duration-300 group-hover:scale-110" />
        </div>
        {service.featured && (
          <Badge className="border-amber-300/60 bg-[#2b210a]/85 text-amber-100 shadow-[0_8px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            Featured
          </Badge>
        )}
      </div>
      <div className="relative">
        <h3 className="text-[1.45rem] font-semibold leading-tight text-white">
          {service.name}
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-white/70">{service.description}</p>
      </div>
    </article>
  );
}
