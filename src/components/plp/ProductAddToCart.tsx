"use client";

import type { ProductItem } from "@/framework/graphql/queries/products";
import type { ProductAddToCartState } from "@/hooks/useProductAddToCart";
import AddToCartButton from "./AddToCartButton";
import ConfigurableOptions from "./ConfigurableOptions";

type ProductAddToCartProps = {
  product: ProductItem;
  cartState: ProductAddToCartState;
  className?: string;
  compact?: boolean;
  showOptions?: boolean;
};

export default function ProductAddToCart({
  product,
  cartState,
  className = "",
  compact = false,
  showOptions = true,
}: ProductAddToCartProps) {
  const {
    configurable,
    viewProduct,
    productUrl,
    selections,
    setSelection,
    canAddToCart,
    handleAddToCart,
    loading,
    options,
  } = cartState;

  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"} ${className}`.trim()}>
      {showOptions && configurable ? (
        <ConfigurableOptions
          options={options}
          selections={selections}
          onSelectionChange={setSelection}
          compact={compact}
        />
      ) : null}

      <AddToCartButton
        productSku={product.sku}
        href={viewProduct ? productUrl : undefined}
        onClick={viewProduct ? undefined : handleAddToCart}
        disabled={viewProduct ? false : !canAddToCart}
        loading={viewProduct ? false : loading}
      />
    </div>
  );
}
