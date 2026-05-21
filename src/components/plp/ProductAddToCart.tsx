"use client";

import type { ProductItem } from "@/framework/graphql/queries/products";
import type { ProductAddToCartState } from "@/hooks/useProductAddToCart";
import { MinusIcon, PlusIcon } from "@/components/Icon";
import AddToCartButton from "./AddToCartButton";
import ConfigurableOptions from "./ConfigurableOptions";

type ProductAddToCartProps = {
  product: ProductItem;
  cartState: ProductAddToCartState;
  className?: string;
  compact?: boolean;
  showOptions?: boolean;
  /** PDP: show quantity stepper (uses cartState.quantity / maxOrderQty) */
  showQuantity?: boolean;
  /** PDP: place quantity and add-to-cart in one horizontal row */
  pdpCartLayout?: boolean;
  /** PDP: disable add to cart (e.g. out of stock) */
  purchaseDisabled?: boolean;
};

export default function ProductAddToCart({
  product,
  cartState,
  className = "",
  compact = false,
  showOptions = true,
  showQuantity = false,
  pdpCartLayout = false,
  purchaseDisabled = false,
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
    quantity,
    setQuantity,
    maxOrderQty,
  } = cartState;

  const showQty = showQuantity && !viewProduct;
  const pdpRow = showQty && pdpCartLayout;

  const bumpQuantity = (delta: number) => {
    setQuantity((previous) => {
      const next = previous + delta;
      return Math.min(maxOrderQty, Math.max(1, next));
    });
  };

  const onQuantityInput = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.min(maxOrderQty, Math.max(1, parsed)));
  };

  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-4"} ${className}`.trim()}>
      {showOptions && configurable ? (
        <ConfigurableOptions
          options={options}
          selections={selections}
          onSelectionChange={setSelection}
          compact={compact}
        />
      ) : null}

      {pdpRow ? (
        <div className="flex flex-row items-stretch gap-x-2.5 lg:gap-x-5">
          <div className="flex shrink-0 items-stretch border border-[#efefef] bg-white">
            <button
              type="button"
              className="flex h-full w-10 items-center justify-center px-1.5 py-2 text-primary-lighter disabled:opacity-40 lg:w-12"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => bumpQuantity(-1)}
            >
              <MinusIcon size={20} />
            </button>
            <label htmlFor={`pdp-qty-${product.sku}`} className="sr-only">
              Quantity
            </label>
            <input
              id={`pdp-qty-${product.sku}`}
              type="number"
              inputMode="numeric"
              min={1}
              max={maxOrderQty}
              value={quantity}
              onChange={(event) => onQuantityInput(event.target.value)}
              className="h-10 lg:h-12 border-x border-[#efefef] [-moz-appearance:textfield] text-center min-h-0 w-11 lg:w-20"
            />
            <button
              type="button"
              className="flex h-full w-10 items-center justify-center px-1.5 py-2 text-primary-lighter disabled:opacity-40 lg:w-12"
              aria-label="Increase quantity"
              disabled={quantity >= maxOrderQty}
              onClick={() => bumpQuantity(1)}
            >
              <PlusIcon size={20} />
            </button>
          </div>
          <AddToCartButton
            productSku={product.sku}
            href={viewProduct ? productUrl : undefined}
            onClick={viewProduct ? undefined : handleAddToCart}
            disabled={viewProduct ? false : !canAddToCart || purchaseDisabled}
            loading={viewProduct ? false : loading}
            variant="pdp"
          />
        </div>
      ) : (
        <>
          {showQty ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-800">Qty</span>
              <div className="flex items-center border border-gray-300">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => bumpQuantity(-1)}
                >
                  <MinusIcon size={20} />
                </button>
                <label htmlFor={`pdp-qty-${product.sku}`} className="sr-only">
                  Quantity
                </label>
                <input
                  id={`pdp-qty-${product.sku}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxOrderQty}
                  value={quantity}
                  onChange={(event) => onQuantityInput(event.target.value)}
                  className="h-10 w-14 border-x border-gray-300 bg-white text-center text-sm font-medium text-gray-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Increase quantity"
                  disabled={quantity >= maxOrderQty}
                  onClick={() => bumpQuantity(1)}
                >
                  <PlusIcon size={20} />
                </button>
              </div>
              {maxOrderQty < 99 ? (
                <span className="text-xs text-gray-500">Max {maxOrderQty} per order</span>
              ) : null}
            </div>
          ) : null}

          <AddToCartButton
            productSku={product.sku}
            href={viewProduct ? productUrl : undefined}
            onClick={viewProduct ? undefined : handleAddToCart}
            disabled={viewProduct ? false : !canAddToCart || purchaseDisabled}
            loading={viewProduct ? false : loading}
          />
        </>
      )}
    </div>
  );
}
