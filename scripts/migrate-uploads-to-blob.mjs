import path from "path";
import { readFile } from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

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

      // Strip matching quotes.
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

/** @type {PrismaClient | null} */
let prisma = null;
const uploadedCache = new Map();

function isLocalUploadUrl(value) {
  return typeof value === "string" && value.startsWith("/uploads/");
}

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
  } catch {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function uploadFromLocalUrl(localUrl) {
  if (!isLocalUploadUrl(localUrl)) return localUrl;
  if (uploadedCache.has(localUrl)) return uploadedCache.get(localUrl);

  const relativePath = localUrl.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const bytes = await readFile(absolutePath);
  const blob = await put(relativePath, bytes, { access: "public" });
  uploadedCache.set(localUrl, blob.url);
  return blob.url;
}

async function migrateProducts() {
  const records = await prisma.product.findMany();
  for (const record of records) {
    const nextImageUrl = await uploadFromLocalUrl(record.imageUrl || "");
    const currentImages = parseJsonArray(record.images);
    const nextImages = [];
    for (const image of currentImages) {
      nextImages.push(await uploadFromLocalUrl(image));
    }
    const changed =
      nextImageUrl !== (record.imageUrl || "") ||
      JSON.stringify(nextImages) !== JSON.stringify(currentImages);
    if (changed) {
      await prisma.product.update({
        where: { id: record.id },
        data: {
          imageUrl: nextImageUrl || null,
          images: nextImages.length ? JSON.stringify(nextImages) : null
        }
      });
      console.log(`[product] migrated: ${record.name}`);
    }
  }
}

async function migrateGalleryItems() {
  const records = await prisma.galleryItem.findMany();
  for (const record of records) {
    const nextImageUrl = await uploadFromLocalUrl(record.imageUrl || "");
    if (nextImageUrl !== (record.imageUrl || "")) {
      await prisma.galleryItem.update({
        where: { id: record.id },
        data: { imageUrl: nextImageUrl || record.imageUrl }
      });
      console.log(`[gallery] migrated: ${record.title}`);
    }
  }
}

async function migrateTestimonials() {
  const records = await prisma.testimonialProject.findMany();
  for (const record of records) {
    const nextImageUrl = await uploadFromLocalUrl(record.imageUrl || "");
    const currentImages = parseJsonArray(record.images);
    const nextImages = [];
    for (const image of currentImages) {
      nextImages.push(await uploadFromLocalUrl(image));
    }
    const changed =
      nextImageUrl !== (record.imageUrl || "") ||
      JSON.stringify(nextImages) !== JSON.stringify(currentImages);
    if (changed) {
      await prisma.testimonialProject.update({
        where: { id: record.id },
        data: {
          imageUrl: nextImageUrl || null,
          images: nextImages.length ? JSON.stringify(nextImages) : null
        }
      });
      console.log(`[testimonial] migrated: ${record.title}`);
    }
  }
}

async function migrateMediaAssets() {
  // Model is MediaItem in the current schema.
  const records = await prisma.mediaItem.findMany();
  for (const record of records) {
    const nextUrl = await uploadFromLocalUrl(record.url || "");
    if (nextUrl !== (record.url || "")) {
      await prisma.mediaItem.update({
        where: { id: record.id },
        data: { url: nextUrl || record.url }
      });
      console.log(`[media] migrated: ${record.id}`);
    }
  }
}

async function migrateUsers() {
  const records = await prisma.user.findMany();
  for (const record of records) {
    const nextAvatar = await uploadFromLocalUrl(record.avatarUrl || "");
    if (nextAvatar !== (record.avatarUrl || "")) {
      await prisma.user.update({
        where: { id: record.id },
        data: { avatarUrl: nextAvatar || null }
      });
      console.log(`[user] migrated: ${record.email}`);
    }
  }
}

async function migrateLeadAttachments() {
  const records = await prisma.lead.findMany({
    where: { attachments: { not: null } }
  });
  for (const record of records) {
    // attachments is stored as a JSON string (or comma/newline list), not a JSON column.
    const current = parseJsonArray(record.attachments);
    const next = [];
    let changed = false;
    for (const item of current) {
      const migrated = await uploadFromLocalUrl(item);
      next.push(migrated);
      if (migrated !== item) changed = true;
    }
    if (!changed) continue;

    await prisma.lead.update({
      where: { id: record.id },
      data: { attachments: next.length ? JSON.stringify(next) : null }
    });
    console.log(`[lead] migrated attachments: ${record.name}`);
  }
}

async function run() {
  // Allow running locally without extra tooling: load .env files if present.
  await loadEnvFile(path.join(process.cwd(), ".env"), { override: false });
  // For one-off prod migrations we want env-local to take precedence over dev defaults.
  await loadEnvFile(path.join(process.cwd(), ".env.local"), { override: true });
  await loadEnvFile(path.join(process.cwd(), ".env.production.local"), { override: true });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  prisma = new PrismaClient();
  console.log("Starting upload migration to Vercel Blob...");
  await migrateProducts();
  await migrateGalleryItems();
  await migrateTestimonials();
  await migrateMediaAssets();
  await migrateUsers();
  await migrateLeadAttachments();
  console.log("Migration complete.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
