import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

function fallbackUrl(requestUrl: string) {
  return new URL("/placeholders/steel-1.svg", requestUrl);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.redirect(fallbackUrl(request.url));
  }

  const requestedPath = `uploads/${path.join("/")}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.redirect(fallbackUrl(request.url));
  }

  try {
    const { blobs } = await list({ prefix: requestedPath, limit: 25 });
    const exact = blobs.find((blob) => blob.pathname === requestedPath);
    if (exact?.url) {
      return NextResponse.redirect(exact.url);
    }
  } catch {
    return NextResponse.redirect(fallbackUrl(request.url));
  }

  return NextResponse.redirect(fallbackUrl(request.url));
}
