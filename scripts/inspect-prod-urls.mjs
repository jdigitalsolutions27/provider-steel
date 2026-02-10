import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

async function loadEnvFile(filePath, { override = false } = {}) {
  try {
    const raw = await readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (!key) continue;

      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (override || process.env[key] == null) process.env[key] = value;
    }
  } catch {
    // ignore missing env file
  }
}

function summarizeUrl(url) {
  if (!url) return "EMPTY";
  if (typeof url !== "string") return `NON_STRING:${typeof url}`;
  if (url.startsWith("/uploads/")) return "LOCAL:/uploads";
  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      return `HTTP:${u.hostname}`;
    } catch {
      return "HTTP:INVALID_URL";
    }
  }
  return `OTHER:${url.slice(0, 24)}`;
}

async function run() {
  await loadEnvFile(path.join(process.cwd(), ".env"), { override: false });
  await loadEnvFile(path.join(process.cwd(), ".env.local"), { override: true });
  await loadEnvFile(path.join(process.cwd(), ".env.production.local"), { override: true });

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient();
  try {
    const testimonials = await prisma.testimonialProject.findMany({
      select: { id: true, title: true, status: true, imageUrl: true, images: true },
      orderBy: { updatedAt: "desc" },
      take: 20
    });

    const counts = { empty: 0, local: 0, http: 0, other: 0 };
    for (const t of testimonials) {
      const s = summarizeUrl(t.imageUrl);
      if (s === "EMPTY") counts.empty++;
      else if (s.startsWith("LOCAL:")) counts.local++;
      else if (s.startsWith("HTTP:")) counts.http++;
      else counts.other++;
    }

    console.log("TESTIMONIAL_PROJECTS (latest 20):");
    console.log(
      testimonials.map((t) => ({
        title: t.title,
        status: t.status,
        imageUrl: summarizeUrl(t.imageUrl),
        images: (t.images || "").slice(0, 80)
      }))
    );
    console.log("TESTIMONIAL_COUNTS:", counts);

    const products = await prisma.product.findMany({
      select: { name: true, imageUrl: true, images: true },
      orderBy: { updatedAt: "desc" },
      take: 20
    });

    const pCounts = { empty: 0, local: 0, http: 0, other: 0 };
    for (const p of products) {
      const s = summarizeUrl(p.imageUrl);
      if (s === "EMPTY") pCounts.empty++;
      else if (s.startsWith("LOCAL:")) pCounts.local++;
      else if (s.startsWith("HTTP:")) pCounts.http++;
      else pCounts.other++;
    }

    console.log("PRODUCTS (latest 20):");
    console.log(products.map((p) => ({ name: p.name, imageUrl: summarizeUrl(p.imageUrl) })));
    console.log("PRODUCT_COUNTS:", pCounts);

    const gallery = await prisma.galleryItem.findMany({
      select: { title: true, imageUrl: true },
      orderBy: { updatedAt: "desc" },
      take: 20
    });
    const gCounts = { empty: 0, local: 0, http: 0, other: 0 };
    for (const g of gallery) {
      const s = summarizeUrl(g.imageUrl);
      if (s === "EMPTY") gCounts.empty++;
      else if (s.startsWith("LOCAL:")) gCounts.local++;
      else if (s.startsWith("HTTP:")) gCounts.http++;
      else gCounts.other++;
    }
    console.log("GALLERY (latest 20):");
    console.log(gallery.map((g) => ({ title: g.title, imageUrl: summarizeUrl(g.imageUrl) })));
    console.log("GALLERY_COUNTS:", gCounts);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

