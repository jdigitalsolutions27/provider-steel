import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const extensionByMime: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp"
};
const maxSize = 5 * 1024 * 1024;

function detectMime(bytes: Buffer): string | null {
  if (bytes.length >= 8) {
    const pngSignature = bytes.subarray(0, 8);
    const isPng =
      pngSignature[0] === 0x89 &&
      pngSignature[1] === 0x50 &&
      pngSignature[2] === 0x4e &&
      pngSignature[3] === 0x47 &&
      pngSignature[4] === 0x0d &&
      pngSignature[5] === 0x0a &&
      pngSignature[6] === 0x1a &&
      pngSignature[7] === 0x0a;
    if (isPng) return "image/png";
  }

  if (bytes.length >= 3) {
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (isJpeg) return "image/jpeg";
  }

  if (bytes.length >= 12) {
    const riff = bytes.subarray(0, 4).toString("ascii");
    const webp = bytes.subarray(8, 12).toString("ascii");
    if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  }

  return null;
}

export async function saveUpload(file?: File | null) {
  if (!file || file.size === 0) return null;
  if (file.type && !allowedTypes.has(file.type)) {
    throw new Error("Invalid file type. Only PNG, JPG, and WEBP are allowed.");
  }
  if (file.size > maxSize) {
    throw new Error("File too large. Max 5MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectMime(bytes);
  if (!detectedMime || !allowedTypes.has(detectedMime)) {
    throw new Error("Invalid image data. Please upload a valid PNG, JPG, or WEBP file.");
  }

  const ext = extensionByMime[detectedMime] || "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  // In production (Vercel), use Blob storage for persistent uploads.
  // In local dev (no blob token), fall back to /public/uploads.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, bytes, {
      access: "public",
      contentType: detectedMime
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);

  return `/uploads/${filename}`;
}
