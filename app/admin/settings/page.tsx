import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/guards";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function SettingsAdminPage() {
  await requireAdminSession();
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const initial = settings || {
    businessName: "G7 Provider Steel Works",
    taglineMain: "PROVIDER STEEL",
    subtitle: "WORKS",
    serviceLine: "Colored Roofing & Steel Frames",
    phone: "",
    email: "",
    address: "",
    messengerUrl: "",
    whatsappUrl: "",
    serviceAreas: "",
    galleryCategories: "",
    logoTextSmall: "G7"
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Settings</p>
        <h2 className="text-lg font-semibold text-white">Site Settings</h2>
      </div>
      <SiteSettingsForm initial={initial} />
    </div>
  );
}
