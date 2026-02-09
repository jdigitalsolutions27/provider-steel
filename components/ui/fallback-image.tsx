"use client";

import { useEffect, useState } from "react";

type FallbackImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc: string;
};

export function FallbackImage({ src, fallbackSrc, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(String(src || ""));

  useEffect(() => {
    setCurrentSrc(String(src || ""));
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

