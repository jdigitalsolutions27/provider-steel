import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const staffPassword = await bcrypt.hash("Staff123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@g7provider.local" },
    update: {
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN"
    },
    create: {
      email: "admin@g7provider.local",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "staff@g7provider.local" },
    update: {
      name: "Staff",
      passwordHash: staffPassword,
      role: "STAFF"
    },
    create: {
      email: "staff@g7provider.local",
      name: "Staff",
      passwordHash: staffPassword,
      role: "STAFF"
    }
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      businessName: "G7 Provider Steel Works",
      taglineMain: "PROVIDER STEEL",
      subtitle: "WORKS",
      serviceLine: "Colored Roofing & Steel Frames",
      phone: "+63 900 000 0000",
      email: "hello@g7provider.local",
      address: "Unit 7, Steelworks Ave, Metro Industrial Park",
      messengerUrl: "https://m.me/g7provider",
      whatsappUrl: "https://wa.me/639000000000",
      serviceAreas: JSON.stringify(["Metro Manila", "Calabarzon", "Central Luzon"]),
      galleryCategories: JSON.stringify([
        "Roofing",
        "Roll-Up Doors",
        "Cee Purlins",
        "Accessories",
        "Coils & Zinc"
      ]),
      productCategories: JSON.stringify([
        "ROOFING",
        "ROLLUP_DOORS",
        "CEE_PURLINS",
        "ACCESSORIES",
        "COILS_ZINC"
      ]),
      logoTextSmall: "G7"
    },
    create: {
      id: 1,
      businessName: "G7 Provider Steel Works",
      taglineMain: "PROVIDER STEEL",
      subtitle: "WORKS",
      serviceLine: "Colored Roofing & Steel Frames",
      phone: "+63 900 000 0000",
      email: "hello@g7provider.local",
      address: "Unit 7, Steelworks Ave, Metro Industrial Park",
      messengerUrl: "https://m.me/g7provider",
      whatsappUrl: "https://wa.me/639000000000",
      serviceAreas: JSON.stringify(["Metro Manila", "Calabarzon", "Central Luzon"]),
      galleryCategories: JSON.stringify([
        "Roofing",
        "Roll-Up Doors",
        "Cee Purlins",
        "Accessories",
        "Coils & Zinc"
      ]),
      productCategories: JSON.stringify([
        "ROOFING",
        "ROLLUP_DOORS",
        "CEE_PURLINS",
        "ACCESSORIES",
        "COILS_ZINC"
      ]),
      logoTextSmall: "G7"
    }
  });

  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {
      heroHeading: "PROVIDER STEEL",
      heroSubheading: "Built for stronger, longer-lasting projects.",
      ctaPrimaryText: "Request a Quote",
      ctaSecondaryText: "Call Now",
      aboutIntro: "We fabricate and supply precision steel systems for modern builds.",
      aboutBody:
        "G7 Provider Steel Works delivers colored roofing, roll-up doors, cee purlins, accessories, and galvanized coils with dependable lead times. From sizing to fabrication, our shop supports contractors, warehouse owners, and project managers with high-accuracy cuts and durable finishes."
    },
    create: {
      id: 1,
      heroHeading: "PROVIDER STEEL",
      heroSubheading: "Built for stronger, longer-lasting projects.",
      ctaPrimaryText: "Request a Quote",
      ctaSecondaryText: "Call Now",
      aboutIntro: "We fabricate and supply precision steel systems for modern builds.",
      aboutBody:
        "G7 Provider Steel Works delivers colored roofing, roll-up doors, cee purlins, accessories, and galvanized coils with dependable lead times. From sizing to fabrication, our shop supports contractors, warehouse owners, and project managers with high-accuracy cuts and durable finishes."
    }
  });

  await prisma.fAQItem.deleteMany();
  await prisma.whyUsItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.testimonialProject.deleteMany();

  await prisma.fAQItem.createMany({
    data: [
      {
        question: "What roofing profiles do you carry?",
        answer: "We stock rib, corrugated, and custom profiles with multiple gauge options.",
        order: 1
      },
      {
        question: "Do you fabricate to custom lengths?",
        answer: "Yes. Provide your measurements and we cut to exact length requirements.",
        order: 2
      },
      {
        question: "How fast can you deliver?",
        answer: "Standard orders are ready within 3-5 business days depending on volume.",
        order: 3
      },
      {
        question: "Do you offer installation?",
        answer: "We can coordinate trusted installation partners for large projects.",
        order: 4
      },
      {
        question: "Can you match custom colors?",
        answer: "We provide a wide palette of pre-painted finishes and can source custom colors.",
        order: 5
      },
      {
        question: "What payment terms are available?",
        answer: "We accept bank transfer, cash, and corporate terms for approved accounts.",
        order: 6
      }
    ]
  });

  await prisma.whyUsItem.createMany({
    data: [
      {
        title: "Precision Fabrication",
        description: "Tight tolerances for consistent fit and installation speed.",
        iconName: "Ruler",
        order: 1
      },
      {
        title: "Fast Quotation",
        description: "We respond quickly with clear, itemized quotes.",
        iconName: "Zap",
        order: 2
      },
      {
        title: "Quality Materials",
        description: "Certified steel with long-lasting coatings.",
        iconName: "ShieldCheck",
        order: 3
      },
      {
        title: "Custom Bending",
        description: "Accessories formed to your specifications.",
        iconName: "Wrench",
        order: 4
      },
      {
        title: "Delivery Ready",
        description: "Safe packaging and reliable transport scheduling.",
        iconName: "Truck",
        order: 5
      },
      {
        title: "Project Support",
        description: "Dedicated team for ongoing projects and repeat clients.",
        iconName: "Users",
        order: 6
      }
    ]
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Prime Ribbed Colored Roofing",
        slug: "prime-ribbed-colored-roofing",
        category: "ROOFING",
        shortDescription: "High-strength rib profile for modern roofing systems.",
        specs: JSON.stringify({
          thickness: "0.40mm - 0.60mm",
          effectiveWidth: "1000mm",
          finish: "Pre-painted",
          length: "Custom cut"
        }),
        colors: JSON.stringify(["Brick Red", "Forest Green", "Royal Blue", "Stone Gray"]),
        featured: true,
        imageUrl: "/placeholders/steel-1.svg"
      },
      {
        name: "Corrugated Roofing Sheets",
        slug: "corrugated-roofing-sheets",
        category: "ROOFING",
        shortDescription: "Classic corrugated profile for industrial coverage.",
        specs: JSON.stringify({
          thickness: "0.35mm - 0.50mm",
          effectiveWidth: "900mm",
          finish: "Pre-painted",
          length: "Custom cut"
        }),
        colors: JSON.stringify(["Bright Red", "Ocean Blue", "Matte Black"]),
        featured: true,
        imageUrl: "/placeholders/steel-2.svg"
      },
      {
        name: "Standing Seam Roofing",
        slug: "standing-seam-roofing",
        category: "ROOFING",
        shortDescription: "Clean, modern seams for premium projects.",
        specs: JSON.stringify({
          thickness: "0.50mm",
          effectiveWidth: "400mm",
          finish: "PVDF",
          length: "Custom cut"
        }),
        colors: JSON.stringify(["Charcoal", "Sandstone", "Deep Blue"]),
        featured: false,
        imageUrl: "/placeholders/steel-3.svg"
      },
      {
        name: "Heavy-Duty Roll-Up Door",
        slug: "heavy-duty-roll-up-door",
        category: "ROLLUP_DOORS",
        shortDescription: "Industrial roll-up doors for warehouses and bays.",
        specs: JSON.stringify({
          gauge: "0.8mm",
          width: "Up to 6m",
          operation: "Manual or motorized"
        }),
        colors: JSON.stringify(["Silver", "Graphite"]),
        featured: true,
        imageUrl: "/placeholders/steel-4.svg"
      },
      {
        name: "Insulated Roll-Up Door Slats",
        slug: "insulated-roll-up-door-slats",
        category: "ROLLUP_DOORS",
        shortDescription: "Thermal and acoustic insulation for secure doors.",
        specs: JSON.stringify({
          thickness: "0.9mm",
          insulation: "PU foam",
          finish: "Powder-coated"
        }),
        colors: JSON.stringify(["White", "Gray", "Black"]),
        featured: false,
        imageUrl: "/placeholders/steel-5.svg"
      },
      {
        name: "Cee Purlin 2x6",
        slug: "cee-purlin-2x6",
        category: "CEE_PURLINS",
        shortDescription: "Structural purlin for roof and wall support.",
        specs: JSON.stringify({
          thickness: "1.2mm - 2.0mm",
          length: "6m standard",
          finish: "Galvanized"
        }),
        colors: JSON.stringify(["Zinc"]),
        featured: true,
        imageUrl: "/placeholders/steel-6.svg"
      },
      {
        name: "Cee Purlin 2x8",
        slug: "cee-purlin-2x8",
        category: "CEE_PURLINS",
        shortDescription: "Heavy-duty framing support for large spans.",
        specs: JSON.stringify({
          thickness: "1.5mm - 2.5mm",
          length: "6m standard",
          finish: "Galvanized"
        }),
        colors: JSON.stringify(["Zinc"]),
        featured: false,
        imageUrl: "/placeholders/steel-7.svg"
      },
      {
        name: "Custom Flashing Set",
        slug: "custom-flashing-set",
        category: "ACCESSORIES",
        shortDescription: "Bended accessories for ridges, hips, and gutters.",
        specs: JSON.stringify({
          thickness: "0.4mm",
          finish: "Pre-painted",
          length: "Custom cut"
        }),
        colors: JSON.stringify(["Red", "Blue", "Gray"]),
        featured: false,
        imageUrl: "/placeholders/steel-8.svg"
      },
      {
        name: "Gutter and Ridge Cap",
        slug: "gutter-and-ridge-cap",
        category: "ACCESSORIES",
        shortDescription: "Essential roof accessories with clean folds.",
        specs: JSON.stringify({
          thickness: "0.4mm",
          finish: "Pre-painted",
          length: "2.4m"
        }),
        colors: JSON.stringify(["Red", "Green", "Brown"]),
        featured: false,
        imageUrl: "/placeholders/steel-1.svg"
      },
      {
        name: "Pre-Painted Steel Coils",
        slug: "pre-painted-steel-coils",
        category: "COILS_ZINC",
        shortDescription: "Color-coated coils for fabrication and roll forming.",
        specs: JSON.stringify({
          thickness: "0.30mm - 1.0mm",
          width: "914mm - 1219mm",
          finish: "Polyester"
        }),
        colors: JSON.stringify(["Red", "Blue", "White", "Gray"]),
        featured: true,
        imageUrl: "/placeholders/steel-2.svg"
      },
      {
        name: "Galvanized Zinc Coils",
        slug: "galvanized-zinc-coils",
        category: "COILS_ZINC",
        shortDescription: "Hot-dipped galvanized coils with uniform coating.",
        specs: JSON.stringify({
          thickness: "0.35mm - 1.2mm",
          width: "914mm - 1219mm",
          coating: "Z120 - Z275"
        }),
        colors: JSON.stringify(["Zinc"]),
        featured: false,
        imageUrl: "/placeholders/steel-3.svg"
      },
      {
        name: "Rib-Type Wall Cladding",
        slug: "rib-type-wall-cladding",
        category: "ROOFING",
        shortDescription: "Durable wall cladding for industrial structures.",
        specs: JSON.stringify({
          thickness: "0.40mm - 0.50mm",
          effectiveWidth: "1000mm",
          finish: "Pre-painted"
        }),
        colors: JSON.stringify(["Slate", "Sand", "Blue"]),
        featured: false,
        imageUrl: "/placeholders/steel-4.svg"
      }
    ]
  });

  await prisma.service.createMany({
    data: [
      {
        name: "Custom Roll Forming",
        slug: "custom-roll-forming",
        description: "Precision roll forming for roofing and steel profiles.",
        featured: true,
        iconName: "Cog"
      },
      {
        name: "Steel Fabrication",
        slug: "steel-fabrication",
        description: "Cutting, bending, and assembly for structural frames.",
        featured: true,
        iconName: "Factory"
      },
      {
        name: "On-Site Delivery",
        slug: "on-site-delivery",
        description: "Scheduled delivery with safe loading and unloading.",
        featured: true,
        iconName: "Truck"
      },
      {
        name: "Project Estimation",
        slug: "project-estimation",
        description: "Quick quotations and bill of materials preparation.",
        featured: false,
        iconName: "ClipboardList"
      },
      {
        name: "Accessory Bending",
        slug: "accessory-bending",
        description: "Custom accessories for ridges, gutters, and trims.",
        featured: false,
        iconName: "Wrench"
      }
    ]
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        title: "Warehouse Roofing Project",
        description: "Prime ribbed roofing installation.",
        imageUrl: "/placeholders/steel-1.svg",
        tags: JSON.stringify(["roofing", "warehouse"]),
        featured: true
      },
      {
        title: "Roll-Up Door Assembly",
        description: "Heavy-duty door for loading bays.",
        imageUrl: "/placeholders/steel-2.svg",
        tags: JSON.stringify(["roll-up", "doors"]),
        featured: true
      },
      {
        title: "Cee Purlin Fabrication",
        description: "Custom lengths cut for a steel frame.",
        imageUrl: "/placeholders/steel-3.svg",
        tags: JSON.stringify(["purlins", "fabrication"]),
        featured: true
      },
      {
        title: "Accessory Bending",
        description: "Bended flashing and trims.",
        imageUrl: "/placeholders/steel-4.svg",
        tags: JSON.stringify(["accessories"])
      },
      {
        title: "Coil Storage",
        description: "Pre-painted coils ready for production.",
        imageUrl: "/placeholders/steel-5.svg",
        tags: JSON.stringify(["coils", "inventory"])
      },
      {
        title: "Color Sampling",
        description: "Finishes approved for a commercial project.",
        imageUrl: "/placeholders/steel-6.svg",
        tags: JSON.stringify(["colors", "finishes"])
      },
      {
        title: "Fabrication Floor",
        description: "Production line in action.",
        imageUrl: "/placeholders/steel-7.svg",
        tags: JSON.stringify(["fabrication"])
      },
      {
        title: "Delivery Ready",
        description: "Packed and ready for transport.",
        imageUrl: "/placeholders/steel-8.svg",
        tags: JSON.stringify(["delivery"])
      }
    ]
  });

  await prisma.testimonialProject.createMany({
    data: [
      {
        title: "Tacloban Port Logistics Roofing Upgrade",
        slug: "tacloban-port-logistics-roofing-upgrade",
        details:
          "Supplied and fabricated long-span colored roofing, accessories, and purlin support for a high-traffic logistics terminal.",
        status: "COMPLETED",
        statusNote: "Turnover completed with client acceptance.",
        imageUrl: "/placeholders/steel-1.svg",
        images: JSON.stringify(["/placeholders/steel-1.svg", "/placeholders/steel-2.svg"]),
        location: "Tacloban City",
        completedAt: new Date("2025-12-18"),
        sortOrder: 1
      },
      {
        title: "Ormoc Commercial Warehouse Frame Build",
        slug: "ormoc-commercial-warehouse-frame-build",
        details:
          "Delivered structural frame members, cee purlins, and custom bended trims for a multi-bay warehouse project.",
        status: "COMPLETED",
        statusNote: "Phase 1 and phase 2 completed.",
        imageUrl: "/placeholders/steel-3.svg",
        images: JSON.stringify(["/placeholders/steel-3.svg", "/placeholders/steel-4.svg"]),
        location: "Ormoc City",
        completedAt: new Date("2025-11-10"),
        sortOrder: 2
      },
      {
        title: "Northern Steel Plant Expansion",
        slug: "northern-steel-plant-expansion",
        details:
          "Ongoing fabrication and delivery of roofing panels, heavy-duty roll-up doors, and perimeter flashing for expansion blocks.",
        status: "ONGOING",
        statusNote: "Fabrication line 2 at 70%",
        imageUrl: "/placeholders/steel-5.svg",
        images: JSON.stringify(["/placeholders/steel-5.svg", "/placeholders/steel-6.svg"]),
        location: "Calabarzon",
        sortOrder: 3
      },
      {
        title: "Metro Distribution Hub Roofing Retrofit",
        slug: "metro-distribution-hub-roofing-retrofit",
        details:
          "Replacing legacy roof system with high-gloss coated sheets while maintaining active logistics operations.",
        status: "ONGOING",
        statusNote: "Installation progress 45%",
        imageUrl: "/placeholders/steel-7.svg",
        images: JSON.stringify(["/placeholders/steel-7.svg", "/placeholders/steel-8.svg"]),
        location: "Metro Manila",
        sortOrder: 4
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
