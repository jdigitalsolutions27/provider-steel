import type { FAQItem } from "@prisma/client";

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card transition hover:border-white/30"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-white">
            {item.question}
          </summary>
          <p className="mt-3 text-sm text-white/70">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
