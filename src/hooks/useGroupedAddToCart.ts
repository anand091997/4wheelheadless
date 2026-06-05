"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import { useAddToCart } from "@/framework/graphql/mutations/cart";
import {
  areGroupedQuantitiesValid,
  buildGroupedAddToCartInputs,
  getDefaultGroupedQuantities,
  getGroupedItems,
  type GroupedQuantities,
} from "@/lib/groupedProduct";

export function useGroupedAddToCart(product: ProductDetailItem) {
  const [quantities, setQuantities] = useState<GroupedQuantities>(() =>
    getDefaultGroupedQuantities(product),
  );
  const { addToCart, loading } = useAddToCart();

  const groupedItems = useMemo(() => getGroupedItems(product), [product]);

  useEffect(() => {
    setQuantities(getDefaultGroupedQuantities(product));
  }, [product.sku]);

  const canAddToCart = useMemo(
    () => areGroupedQuantitiesValid(quantities),
    [quantities],
  );

  const setChildQuantity = useCallback((sku: string, qty: number) => {
    setQuantities((previous) => ({
      ...previous,
      [sku]: Math.max(0, Math.min(99, Math.floor(qty) || 0)),
    }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) {
      toast.error("Enter a quantity for at least one item.");
      return;
    }

    try {
      const inputs = buildGroupedAddToCartInputs(quantities);
      await addToCart(inputs);
      toast.success("Products added to cart successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add products to cart.";
      toast.error(message);
    }
  }, [addToCart, canAddToCart, quantities]);

  return {
    groupedItems,
    quantities,
    setChildQuantity,
    canAddToCart,
    handleAddToCart,
    loading,
  };
}

export type GroupedAddToCartState = ReturnType<typeof useGroupedAddToCart>;
