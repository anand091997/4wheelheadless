"use client";

import Link from "next/link";
import { CompareIcon, WishlistIcon } from "@/components/Icon";
import type { ProductItem } from "@/framework/graphql";
import { useProductAddToCart } from "@/hooks/useProductAddToCart";
import { getProductUrl } from "@/lib/product";
import ConfigurableOptions from "./ConfigurableOptions";
import ProductAddToCart from "./ProductAddToCart";
import ProductCardImage from "./ProductCardImage";

type ProductCardProps = {
  product: ProductItem;
  compact?: boolean;
};

function formatPrice(value: number | undefined, currency: string | undefined) {
  if (typeof value !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const cartState = useProductAddToCart(product);
  const { configurable, displayImage, options, selections, setSelection } = cartState;

  const minPrice = product.price_range?.minimum_price;
  const regular = minPrice?.regular_price;
  const final = minPrice?.final_price;
  const hasDiscount = Boolean(
    regular && final && regular.value > final.value && minPrice?.discount?.percent_off
  );

  const imageClassName = compact
    ? "aspect-square h-full w-full max-w-[287px] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.2]"
    : "aspect-square h-full w-full max-h-full max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.2]";
  const productHref = getProductUrl(product);

  if (compact) {
    return (
      <article className="product-item group flex min-w-0 flex-col overflow-hidden border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] sm:flex-row">
        <div className="flex shrink-0 items-center justify-center overflow-hidden p-5">
          <Link
            href={productHref}
            title={product.name}
            className="product-item-photo block"
            tabIndex={-1}
          >
            <ProductCardImage
              displayImage={displayImage}
              fallbackName={product.name}
              imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.2]"
            />
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-base font-medium text-gray-900">
              <Link href={productHref} className="product-item-link">
                {product.name}
              </Link>
            </h3>
            <div className="mt-3 mb-3">
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold md:text-2xl">
                    {formatPrice(final?.value, final?.currency)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(regular?.value, regular?.currency)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold md:text-2xl">
                  {formatPrice(final?.value ?? regular?.value, final?.currency ?? regular?.currency)}
                </span>
              )}
            </div>

            {configurable ? (
              <div className="mb-3">
                <ConfigurableOptions
                  options={options}
                  selections={selections}
                  onSelectionChange={setSelection}
                  compact
                />
              </div>
            ) : null}

            <div className="mt-auto flex gap-3 items-center sm:gap-2 lg:gap-5">
              <div className="w-full min-w-0 flex-1 sm:max-w-[288px]">
                <ProductAddToCart
                  product={product}
                  cartState={cartState}
                  showOptions={false}
                  compact
                />
              </div>
              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-7 w-7 items-center justify-center text-[#51565b]"
              >
                <WishlistIcon className="h-5 w-5 text-current md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                aria-label="Add to compare"
                className="flex h-7 w-7 items-center justify-center text-[#51565b]"
              >
                <CompareIcon className="h-5 w-5 text-current md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="product-item group relative flex h-full min-w-0 flex-col border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Add to wishlist"
          className="flex h-7 w-7 items-center justify-center text-[#51565b]"
        >
          <WishlistIcon className="h-5 w-5 text-current md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          aria-label="Add to compare"
          className="flex h-7 w-7 items-center justify-center text-[#51565b]"
        >
          <CompareIcon className="h-5 w-5 text-current md:h-6 md:w-6" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2 lg:p-5">
        <div className="mb-3 flex items-center justify-center overflow-hidden">
          <Link
            href={productHref}
            title={product.name}
            className="product-item-photo block w-full max-w-[287px]"
            tabIndex={-1}
          >
            <ProductCardImage
              displayImage={displayImage}
              fallbackName={product.name}
              imageClassName={imageClassName}
            />
          </Link>
        </div>

        <h3 className="mb-3 min-w-0 flex-1">
          <Link href={productHref} className="product-item-link">
            {product.name}
          </Link>
        </h3>

        <div className="price-container mb-3 flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="price font-[Barlow,sans-serif] text-base font-bold leading-6 text-gray-900 md:text-2xl md:leading-8">
                  {formatPrice(final?.value, final?.currency)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(regular?.value, regular?.currency)}
                </span>
              </div>
            ) : (
              <span className="price font-[Barlow,sans-serif] text-base font-bold leading-6 text-gray-900 md:text-2xl md:leading-8">
                {formatPrice(final?.value ?? regular?.value, final?.currency ?? regular?.currency)}
              </span>
            )}
          </div>
        </div>

        {configurable ? (
          <div className="mb-3">
            <ConfigurableOptions
              options={options}
              selections={selections}
              onSelectionChange={setSelection}
            />
          </div>
        ) : null}

        <ProductAddToCart product={product} cartState={cartState} showOptions={false} />
      </div>
    </article>
  );
}
