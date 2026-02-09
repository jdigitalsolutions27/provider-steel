import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { FAQManager } from "@/components/admin/faq-manager";
import { WhyUsManager } from "@/components/admin/whyus-manager";

export default async function ContentAdminPage() {
  await requireAdminSession();
  const [content, faqs, whyUs] = await Promise.all([
    prisma.siteContent.findUnique({ where: { id: 1 } }),
    prisma.fAQItem.findMany({ orderBy: { order: "asc" } }),
    prisma.whyUsItem.findMany({ orderBy: { order: "asc" } })
  ]);

  const safeContent = content || {
    heroHeading: "PROVIDER STEEL",
    heroSubheading: "Built for stronger projects.",
    ctaPrimaryText: "Request a Quote",
    ctaSecondaryText: "Call Now",
    aboutIntro: "We fabricate and supply precision steel systems.",
    aboutBody: "G7 Provider Steel Works delivers colored roofing and fabrication."
  };

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Hero & About Content</h2>
        <div className="mt-4">
          <SiteContentForm initial={safeContent} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">FAQs</h2>
        <div className="mt-4">
          <FAQManager items={faqs} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Why Choose Us</h2>
        <div className="mt-4">
          <WhyUsManager items={whyUs} />
        </div>
      </div>
    </div>
  );
}