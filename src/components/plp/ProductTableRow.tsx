"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CartIcon, CompareIcon, WishlistIcon } from "@/components/Icon";
import type { ProductItem } from "@/framework/graphql";
import { useProductAddToCart } from "@/hooks/useProductAddToCart";
import ConfigurableOptions from "./ConfigurableOptions";
import ProductCardImage from "./ProductCardImage";

const tableBorder = "border-[#d2d2d2]";

type ProductTableRowProps = {
  product: ProductItem;
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

function TableActionButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-1 transition-colors hover:text-[#F50028] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function ProductTableRow({ product }: ProductTableRowProps) {
  const {
    configurable,
    selections,
    setSelection,
    canAddToCart,
    handleAddToCart,
    loading,
    options,
    displayImage,
  } = useProductAddToCart(product);

  const minPrice = product.price_range?.minimum_price;
  const regular = minPrice?.regular_price;
  const final = minPrice?.final_price;
  const productHref = product.url_key ? `/${product.url_key}` : "#";

  return (
    <tr className="product-tr bg-white">
      <td
        className={`w-30 border-y border-l border-solid ${tableBorder} p-3 align-middle`}
      >
        <Link
          href={productHref}
          title={product.name}
          className="product-item-photo block cursor-pointer"
          tabIndex={-1}
        >
          <span className="inline-block h-[86px] w-[86px]">
            <ProductCardImage
              displayImage={displayImage}
              fallbackName={product.name}
              compactLoader
            />
          </span>
        </Link>
      </td>
      <td
        className={`max-w-72 border-y border-solid ${tableBorder} p-2 align-middle text-base font-bold`}
      >
        <Link href={productHref} className="product-item-link line-clamp-3 hover:text-[#F50028]">
          {product.name}
        </Link>
        {configurable ? (
          <div className="mt-3 font-normal">
            <ConfigurableOptions
              options={options}
              selections={selections}
              onSelectionChange={setSelection}
              compact
            />
          </div>
        ) : null}
      </td>
      <td className={`border-y border-solid ${tableBorder} p-2 align-middle text-sm`}>
        {product.sku}
      </td>
      <td className={`price-td border-y border-solid ${tableBorder} p-2 align-middle`}>
        <span className="price text-sm font-bold">
          {formatPrice(final?.value ?? regular?.value, final?.currency ?? regular?.currency)}
        </span>
      </td>
      <td className={`border-y border-r border-solid ${tableBorder} p-2 align-middle`}>
        <div className="flex items-center gap-3 text-[#51565b]">
          <TableActionButton
            label={`Add ${product.sku} to cart`}
            disabled={!canAddToCart || loading}
            onClick={handleAddToCart}
          >
            <CartIcon className="h-5 w-5 md:h-6 md:w-6" />
          </TableActionButton>
          <TableActionButton label={`Add ${product.sku} to compare`}>
            <CompareIcon className="h-5 w-5 md:h-6 md:w-6" />
          </TableActionButton>
          <TableActionButton label={`Add ${product.sku} to wishlist`}>
            <WishlistIcon className="h-5 w-5 md:h-6 md:w-6" />
          </TableActionButton>
        </div>
      </td>
    </tr>
  );
}
