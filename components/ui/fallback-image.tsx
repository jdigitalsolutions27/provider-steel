"use client";

import { useEffect, useState } from "react";

type FallbackImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc: string;
};

function normalizeImageSource(input: unknown) {
  if (!input) return "";
  const raw = String(input).trim();
  if (!raw) return "";

  // Handle values accidentally stored as JSON array strings.
  if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const first = parsed.find((value) => typeof value === "string" && value.trim().length > 0);
        return first ? String(first).trim() : "";
      }
    } catch {
      // Fall through and treat as plain text.
    }
  }

  const normalized = raw.replace(/^["']+|["']+$/g, "");
  if (normalized.includes(",")) {
    const first = normalized
      .split(",")
      .map((value) => value.trim().replace(/^["']+|["']+$/g, ""))
      .find((value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"));
    if (first) return first;
  }
  return normalized;
}

export function FallbackImage({ src, fallbackSrc, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(normalizeImageSource(src));

  useEffect(() => {
    setCurrentSrc(normalizeImageSource(src));
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={currentSrc || fallbackSrc}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
