import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import type { ProductDisplayImage } from "@/lib/configurableProduct";

export function buildGalleryImagesFromDetail(product: ProductDetailItem): ProductDisplayImage[] {
  const gallery = product.media_gallery ?? [];
  const sorted = [...gallery].sort((a, b) => {
    const pa = typeof a.position === "number" ? a.position : 999;
    const pb = typeof b.position === "number" ? b.position : 999;
    return pa - pb;
  });

  const fromGallery = sorted
    .map((entry) => {
      const url = entry.url?.trim();
      if (!url) {
        return null;
      }
      return {
        url,
        label: entry.label?.trim() || product.name,
      };
    })
    .filter((entry): entry is ProductDisplayImage => Boolean(entry));

  if (fromGallery.length > 0) {
    return fromGallery;
  }

  const primary =
    product.image?.url?.trim() ||
    product.small_image?.url?.trim() ||
    product.thumbnail?.url?.trim();

  if (primary) {
    return [
      {
        url: primary,
        label:
          product.image?.label?.trim() ||
          product.small_image?.label?.trim() ||
          product.thumbnail?.label?.trim() ||
          product.name,
      },
    ];
  }

  return [];
}

/**
 * Slides for the PDP gallery. When a configurable variant image is not in the gallery list,
 * it is prepended so Swiper can show it as the first slide.
 */
export function buildPdpSlides(
  product: ProductDetailItem,
  gallery: ProductDisplayImage[],
  configurable: boolean,
  displayImage: ProductDisplayImage | null,
): ProductDisplayImage[] {
  const base =
    gallery.length > 0
      ? gallery
      : displayImage?.url?.trim()
        ? [
            {
              url: displayImage.url.trim(),
              label: displayImage.label?.trim() || product.name,
            },
          ]
        : [];

  if (!configurable || !displayImage?.url?.trim()) {
    return base;
  }

  const trimmed = displayImage.url.trim();
  if (base.some((s) => s.url.trim() === trimmed)) {
    return base;
  }

  return [
    {
      url: trimmed,
      label: displayImage.label?.trim() || product.name,
    },
    ...base,
  ];
}
