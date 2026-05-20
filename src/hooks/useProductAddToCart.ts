"use client";

import { useCallback, useMemo, useState } from "react";
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
  const { addToCart, loading } = useAddToCart();

  const viewProduct = requiresProductPage(product);
  const productUrl = getProductUrl(product);
  const configurable = !viewProduct && isConfigurableProduct(product);
  const canAddToCart =
    !configurable || areAllConfigurableOptionsSelected(product, selections);

  const displayImage = useMemo(
    () => getDisplayImage(product, selections),
    [product, selections],
  );

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
      const input = buildAddToCartInput(product, selections);
      await addToCart(input);
      toast.success("Product added to cart successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not add product to cart.";
      toast.error(message);
    }
  }, [addToCart, canAddToCart, product, selections]);

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
    options: configurable
      ? sortConfigurableOptions(product.configurable_options)
      : [],
  };
}

export type ProductAddToCartState = ReturnType<typeof useProductAddToCart>;
