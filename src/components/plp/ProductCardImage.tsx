"use client";

import { useEffect, useState } from "react";
import type { ProductDisplayImage } from "@/lib/configurableProduct";

type ProductCardImageProps = {
  displayImage: ProductDisplayImage | null;
  fallbackName: string;
  className?: string;
  imageClassName?: string;
  compactLoader?: boolean;
};

function ImageLoader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-white/60"
      aria-hidden="true"
    >
      <span
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-[#F50028] ${
          compact ? "h-6 w-6" : "h-9 w-9"
        }`}
      />
    </div>
  );
}

export default function ProductCardImage({
  displayImage,
  fallbackName,
  className = "",
  imageClassName = "",
  compactLoader = false,
}: ProductCardImageProps) {
  const imageUrl = displayImage?.url?.trim() ?? "";
  const [shownUrl, setShownUrl] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setShownUrl("");
      setIsLoading(false);
      return;
    }

    if (imageUrl === shownUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const preload = new window.Image();
    preload.onload = () => {
      setShownUrl(imageUrl);
      setIsLoading(false);
    };
    preload.onerror = () => {
      setIsLoading(false);
    };
    preload.src = imageUrl;

    return () => {
      preload.onload = null;
      preload.onerror = null;
    };
  }, [imageUrl, shownUrl]);

  const wrapperClassName = compactLoader
    ? `relative h-[86px] w-[86px] shrink-0 ${className}`.trim()
    : `relative aspect-square w-full max-w-[287px] shrink-0 ${className}`.trim();

  if (!shownUrl && !imageUrl) {
    return (
      <div
        className={`bg-gray-100 ${compactLoader ? "h-[86px] w-[86px]" : "aspect-square w-full max-w-[287px]"} ${className}`.trim()}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      {isLoading ? <ImageLoader compact={compactLoader} /> : null}
      <img
        src={shownUrl || imageUrl}
        alt={displayImage?.label || fallbackName}
        className={`h-full w-full object-contain ${imageClassName}`}
        loading="lazy"
        width={compactLoader ? 86 : 287}
        height={compactLoader ? 86 : 287}
      />
    </div>
  );
}
