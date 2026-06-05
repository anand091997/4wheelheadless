"use client";

import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import { useBundleAddToCart } from "@/hooks/useBundleAddToCart";
import { useGroupedAddToCart } from "@/hooks/useGroupedAddToCart";
import type { ProductAddToCartState } from "@/hooks/useProductAddToCart";
import { isBundleProduct, isGroupedProduct } from "@/lib/product";
import { MinusIcon, PlusIcon } from "@/components/Icon";
import ProductAddToCart from "@/components/plp/ProductAddToCart";
import AddToCartButton from "@/components/plp/AddToCartButton";
import BundleProductOptions from "./BundleProductOptions";
import GroupedProductItems from "./GroupedProductItems";

type ProductPdpPurchaseProps = {
  product: ProductDetailItem;
  purchaseDisabled?: boolean;
};

type StandardPdpPurchaseProps = ProductPdpPurchaseProps & {
  /** Shared with PDP gallery so configurable option changes update the main image */
  cartState: ProductAddToCartState;
};

function PdpQuantityStepper({
  id,
  quantity,
  maxOrderQty,
  onChange,
}: {
  id: string;
  quantity: number;
  maxOrderQty: number;
  onChange: (qty: number) => void;
}) {
  const bump = (delta: number) => {
    onChange(Math.min(maxOrderQty, Math.max(1, quantity + delta)));
  };

  return (
    <div className="flex shrink-0 items-stretch border border-[#efefef] bg-white">
      <button
        type="button"
        className="flex h-full w-10 items-center justify-center px-1.5 py-2 text-primary-lighter disabled:opacity-40 lg:w-12"
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
        onClick={() => bump(-1)}
      >
        <MinusIcon size={20} />
      </button>
      <label htmlFor={id} className="sr-only">
        Quantity
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={maxOrderQty}
        value={quantity}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(parsed) ? 1 : Math.min(maxOrderQty, Math.max(1, parsed)));
        }}
        className="h-10 md:h-12 border-x border-[#efefef] [-moz-appearance:textfield] text-center min-h-0 w-11 lg:w-20"
      />
      <button
        type="button"
        className="flex h-full w-10 items-center justify-center px-1.5 py-2 text-primary-lighter disabled:opacity-40 lg:w-12"
        aria-label="Increase quantity"
        disabled={quantity >= maxOrderQty}
        onClick={() => bump(1)}
      >
        <PlusIcon size={20} />
      </button>
    </div>
  );
}

function BundlePdpPurchase({
  product,
  purchaseDisabled,
}: ProductPdpPurchaseProps) {
  const bundleState = useBundleAddToCart(product);

  return (
    <div className="flex w-full flex-col gap-6">
      <BundleProductOptions bundleItems={bundleState.bundleItems} state={bundleState} />
      <div className="flex flex-row items-stretch gap-x-2.5 lg:gap-x-5">
        <PdpQuantityStepper
          id={`pdp-qty-${product.sku}`}
          quantity={bundleState.quantity}
          maxOrderQty={bundleState.maxOrderQty}
          onChange={(qty) => bundleState.setQuantity(qty)}
        />
        <AddToCartButton
          productSku={product.sku}
          onClick={bundleState.handleAddToCart}
          disabled={!bundleState.canAddToCart || purchaseDisabled}
          loading={bundleState.loading}
          variant="pdp-row"
        />
      </div>
    </div>
  );
}

function GroupedPdpPurchase({
  product,
  purchaseDisabled,
}: ProductPdpPurchaseProps) {
  const groupedState = useGroupedAddToCart(product);

  return (
    <div className="grouped-pdp-purchase flex w-full min-w-0 flex-col gap-4">
      <GroupedProductItems state={groupedState} />
      <div className="w-full min-w-0">
        <AddToCartButton
          productSku={product.sku}
          onClick={groupedState.handleAddToCart}
          disabled={!groupedState.canAddToCart || purchaseDisabled}
          loading={groupedState.loading}
          variant="pdp-full"
        />
      </div>
    </div>
  );
}

function StandardPdpPurchase({
  product,
  cartState,
  purchaseDisabled,
}: StandardPdpPurchaseProps) {
  return (
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
  );
}

type ProductPdpPurchaseRootProps = ProductPdpPurchaseProps & {
  cartState: ProductAddToCartState;
};

export default function ProductPdpPurchase({
  product,
  cartState,
  purchaseDisabled = false,
}: ProductPdpPurchaseRootProps) {
  if (isBundleProduct(product)) {
    return <BundlePdpPurchase product={product} purchaseDisabled={purchaseDisabled} />;
  }

  if (isGroupedProduct(product)) {
    return <GroupedPdpPurchase product={product} purchaseDisabled={purchaseDisabled} />;
  }

  return (
    <StandardPdpPurchase
      product={product}
      cartState={cartState}
      purchaseDisabled={purchaseDisabled}
    />
  );
}
