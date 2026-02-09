import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  return {
    id: 1,
    businessName: "G7 Provider Steel Works",
    taglineMain: "PROVIDER STEEL",
    subtitle: "WORKS",
    serviceLine: "Colored Roofing & Steel Frames",
    phone: "",
    email: "",
    address: "",
    messengerUrl: "",
    whatsappUrl: "",
    serviceAreas: [],
    galleryCategories: "Roofing, Roll-Up Doors, Cee Purlins, Accessories, Coils & Zinc",
    productCategories: "ROOFING, ROLLUP_DOORS, CEE_PURLINS, ACCESSORIES, COILS_ZINC",
    logoTextSmall: "G7"
  };
}

export async function getSiteContent() {
  const content = await prisma.siteContent.findUnique({ where: { id: 1 } });
  if (content) return content;
  return {
    id: 1,
    heroHeading: "PROVIDER STEEL",
    heroSubheading: "Built for stronger, longer-lasting projects.",
    ctaPrimaryText: "Request a Quote",
    ctaSecondaryText: "Call Now",
    aboutIntro: "We fabricate and supply precision steel systems for modern builds.",
    aboutBody: "G7 Provider Steel Works delivers colored roofing, roll-up doors, cee purlins, accessories, and galvanized coils with dependable lead times."
  };
}
