const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return trimmed
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function mergeTags(existing, incoming) {
  const all = [...existing, ...incoming].map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(all));
}

async function main() {
  const products = await prisma.product.findMany({
    select: { name: true, category: true, imageUrl: true, images: true }
  });

  const imageMap = new Map();

  for (const product of products) {
    const images = parseJsonArray(product.images);
    if (product.imageUrl) images.unshift(product.imageUrl);
    images.forEach((url) => {
      if (!imageMap.has(url)) {
        imageMap.set(url, { name: product.name, category: product.category });
      }
    });
  }

  const items = await prisma.galleryItem.findMany({
    select: { id: true, imageUrl: true, tags: true, title: true, description: true }
  });

  let updated = 0;

  for (const item of items) {
    const match = imageMap.get(item.imageUrl);
    if (!match) continue;
    const existingTags = parseJsonArray(item.tags);
    const tags = mergeTags(existingTags, [
      match.name,
      "Product",
      `Category:${match.category}`
    ]);

    await prisma.galleryItem.update({
      where: { id: item.id },
      data: {
        tags: JSON.stringify(tags),
        title: item.title || match.name,
        description: item.description || "Product image"
      }
    });
    updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} gallery items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
