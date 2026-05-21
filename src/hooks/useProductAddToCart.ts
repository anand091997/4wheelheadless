"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  areAllConfigurableOptionsSelected,
  buildAddToCartInput,
  getDisplayImage,
  isConfigurableProduct,
  sortConfigurableOptions,
} from "@/lib/configurableProduct";
import { getProductUrl, requiresProductPage } from "@/lib/product";
import type { ProductItem } from "@/framework/graphql/queries/products";
import { useAddToCart } from "@/framework/graphql/mutations/cart";

export function useProductAddToCart(product: ProductItem) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading } = useAddToCart();

  useEffect(() => {
    setQuantity(1);
    setSelections({});
  }, [product.sku]);

  const viewProduct = requiresProductPage(product);
  const productUrl = getProductUrl(product);
  const configurable = !viewProduct && isConfigurableProduct(product);
  const canAddToCart =
    !configurable || areAllConfigurableOptionsSelected(product, selections);

  const displayImage = useMemo(
    () => getDisplayImage(product, selections),
    [product, selections],
  );

  const maxOrderQty = useMemo(() => {
    const cap = product.only_x_left_in_stock;
    if (typeof cap === "number" && cap >= 1) {
      return Math.min(99, cap);
    }
    return 99;
  }, [product.only_x_left_in_stock]);

  useEffect(() => {
    setQuantity((quantityValue) =>
      Math.min(maxOrderQty, Math.max(1, quantityValue)),
    );
  }, [maxOrderQty]);

  const setSelection = useCallback((optionUid: string, valueUid: string) => {
    setSelections((previous) => ({
      ...previous,
      [optionUid]: valueUid,
    }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) {
      toast.error("Please select all required options.");
      return;
    }

    try {
      const input = buildAddToCartInput(product, selections, quantity);
      await addToCart(input);
      toast.success(
        quantity > 1
          ? `${quantity} items added to cart successfully.`
          : "Product added to cart successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add product to cart.";
      toast.error(message);
    }
  }, [addToCart, canAddToCart, product, quantity, selections]);

  return {
    configurable,
    viewProduct,
    productUrl,
    selections,
    setSelection,
    canAddToCart,
    handleAddToCart,
    loading,
    displayImage,
    quantity,
    setQuantity,
    maxOrderQty,
    options: configurable
      ? sortConfigurableOptions(product.configurable_options)
      : [],
  };
}

export type ProductAddToCartState = ReturnType<typeof useProductAddToCart>;
