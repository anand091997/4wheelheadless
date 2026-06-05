"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import { useAddToCart } from "@/framework/graphql/mutations/cart";
import type { BundleItem } from "@/lib/bundleProduct";
import {
  areBundleSelectionsValid,
  buildBundleAddToCartInput,
  getBundleItems,
  getDefaultBundleSelections,
  toggleBundleOption,
  type BundleSelections,
} from "@/lib/bundleProduct";

export function useBundleAddToCart(product: ProductDetailItem) {
  const [selections, setSelections] = useState<BundleSelections>(() =>
    getDefaultBundleSelections(product),
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading } = useAddToCart();

  const bundleItems = useMemo(() => getBundleItems(product), [product]);

  useEffect(() => {
    setSelections(getDefaultBundleSelections(product));
    setQuantity(1);
  }, [product.sku]);

  const canAddToCart = useMemo(
    () => areBundleSelectionsValid(product, selections),
    [product, selections],
  );

  const setBundleOption = useCallback((item: BundleItem, optionUid: string) => {
    setSelections((previous) => ({
      ...previous,
      [item.uid]: toggleBundleOption(item, previous[item.uid] ?? [], optionUid),
    }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) {
      toast.error("Please select all required bundle options.");
      return;
    }

    try {
      const input = buildBundleAddToCartInput(product, selections, quantity);
      await addToCart(input);
      toast.success(
        quantity > 1
          ? `${quantity} bundles added to cart successfully.`
          : "Product added to cart successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add product to cart.";
      toast.error(message);
    }
  }, [addToCart, canAddToCart, product, quantity, selections]);

  return {
    bundleItems,
    selections,
    setBundleOption,
    canAddToCart,
    handleAddToCart,
    loading,
    quantity,
    setQuantity,
    maxOrderQty: 99,
  };
}

export type BundleAddToCartState = ReturnType<typeof useBundleAddToCart>;
