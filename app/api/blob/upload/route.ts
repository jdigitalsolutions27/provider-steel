import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { assertAdmin } from "@/lib/guards";

export async function POST(request: Request) {
  await assertAdmin();

  const body = await request.json();

  const json = await handleUpload({
    request,
    body,
    onBeforeGenerateToken: async (pathname) => {
      // Only allow writing into a controlled prefix.
      // Client code always uses `uploads/...`.
      if (!pathname.startsWith("uploads/")) {
        throw new Error("Invalid upload path.");
      }

      return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 5 * 1024 * 1024,
        addRandomSuffix: true
      };
    },
    onUploadCompleted: async () => {
      // No-op: we persist blob URLs in server actions when saving records.
    }
  });

  return NextResponse.json(json);
}

