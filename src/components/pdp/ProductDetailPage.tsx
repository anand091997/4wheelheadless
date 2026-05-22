"use client";

import { useMemo } from "react";
import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import { useProductAddToCart } from "@/hooks/useProductAddToCart";
import { requiresProductPage } from "@/lib/product";
import { buildGalleryImagesFromDetail, buildPdpSlides } from "@/lib/pdpGallery";
import ProductAddToCart from "@/components/plp/ProductAddToCart";
import ProductGallery from "@/components/pdp/ProductGallery";
import ProductPdpAccordions from "@/components/pdp/ProductPdpAccordions";
import ProductRatingSummary from "@/components/pdp/ProductRatingSummary";
import ProductReviewsSection from "@/components/pdp/ProductReviewsSection";

function formatPrice(value: number | undefined, currency: string | undefined) {
  if (typeof value !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

type ProductDetailPageProps = {
  product: ProductDetailItem;
};

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const cartState = useProductAddToCart(product);
  const { configurable, displayImage } = cartState;

  const gallery = useMemo(() => buildGalleryImagesFromDetail(product), [product]);
  const slides = useMemo(
    () => buildPdpSlides(product, gallery, configurable, displayImage),
    [product, gallery, configurable, displayImage],
  );

  const activeSlideUrl =
    configurable && displayImage?.url?.trim() ? displayImage.url.trim() : null;

  const minPrice = product.price_range?.minimum_price;
  const regular = minPrice?.regular_price;
  const final = minPrice?.final_price;
  const hasDiscount = Boolean(
    regular && final && regular.value > final.value && minPrice?.discount?.percent_off,
  );

  const shortHtml = product.short_description?.html?.trim();
  const longHtml = product.description?.html?.trim();
  const needsConfigurator = requiresProductPage(product);
  const purchaseDisabled = product.stock_status === "OUT_OF_STOCK";

  const overviewContent = (
    <div className="prose mb-2 [&_p]:mb-2 text-base text-[#334155]">
      {shortHtml ? (
        <div dangerouslySetInnerHTML={{ __html: shortHtml }} />
      ) : null}
      {longHtml ? (
        <div
          className={shortHtml ? "mt-6" : ""}
          dangerouslySetInnerHTML={{ __html: longHtml }}
        />
      ) : null}
      {!shortHtml && !longHtml ? (
        <p className="not-prose text-sm text-gray-600">No product description available.</p>
      ) : null}
    </div>
  );

  return (
    <main className="mx-auto container px-4 py-8 md:py-12">
      <div className="grid grid-rows-auto grid-cols-1 gap-5 md:grid-cols-[56%_minmax(0,_1fr)] md:grid-rows-[min-content_minmax(0,_1fr)] xl:gap-x-10 w-full">
        <div className="product-gallery w-full md:row-start-1 md:row-span-2 md:col-start-1">
          <ProductGallery
            slides={slides}
            productName={product.name ?? ""}
            activeSlideUrl={activeSlideUrl}
          />
        </div>

        <div className="product-info w-full mb-2 lg:mb-6 relative">
          <h1 className="text-xl font-bold lg:text-2xl mb-2 lg:mb-3">{product.name}</h1>

          <ProductRatingSummary
            reviewCount={product.review_count}
            ratingSummary={product.rating_summary}
            className="mb-2 lg:mb-4"
          />

          {hasDiscount ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="price-wrapper title-font font-bold text-xl lg:text-2xl xl:text-3xl">
                {formatPrice(final?.value, final?.currency)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(regular?.value, regular?.currency)}
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <span className="price-wrapper title-font font-bold text-xl lg:text-2xl xl:text-3xl">
                {formatPrice(final?.value ?? regular?.value, final?.currency ?? regular?.currency)}
              </span>
            </div>
          )}

          {needsConfigurator ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Bundle and grouped products need a dedicated configurator on the product page. That
              flow is not wired yet; this page is set up for simple (and configurable) products first.
            </p>
          ) : (
            <>
              {purchaseDisabled ? (
                <p className="mb-3 text-sm font-medium text-red-800">This item is currently out of stock.</p>
              ) : null}
              <ProductAddToCart
                product={product}
                cartState={cartState}
                showOptions
                showQuantity
                pdpCartLayout
                purchaseDisabled={purchaseDisabled}
                className="w-full"
              />
            </>
          )}

          <ProductPdpAccordions
              overview={overviewContent}
              reviews={<ProductReviewsSection product={product} />}
            />
        </div>
      </div>
    </main>
  );
}
