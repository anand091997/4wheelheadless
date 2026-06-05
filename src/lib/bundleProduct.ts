import type {
  BundleItem,
  BundleItemOption,
  ProductDetailItem,
} from "@/framework/graphql/queries/productDetail";
import type { AddToCartItemInput } from "@/lib/configurableProduct";
import { isBundleProduct } from "@/lib/product";

export type { BundleItem, BundleItemOption };

export type BundleSelections = Record<string, string[]>;

function isMultiSelectBundleType(type: string): boolean {
  const normalized = type.toLowerCase();
  return normalized === "checkbox" || normalized === "multi";
}

export function getBundleItems(product: ProductDetailItem): BundleItem[] {
  if (!isBundleProduct(product)) {
    return [];
  }
  return (product.items as BundleItem[] | null | undefined) ?? [];
}

export function getDefaultBundleSelections(product: ProductDetailItem): BundleSelections {
  const selections: BundleSelections = {};

  for (const item of getBundleItems(product)) {
    const options = item.options ?? [];
    const defaults = options.filter((option) => option.is_default).map((option) => option.uid);
    const initial =
      defaults.length > 0
        ? defaults
        : item.required && options.length === 1
          ? [options[0].uid]
          : [];

    if (initial.length > 0) {
      selections[item.uid] = initial;
    }
  }

  return selections;
}

export function toggleBundleOption(
  item: BundleItem,
  current: string[],
  optionUid: string,
): string[] {
  if (isMultiSelectBundleType(item.type)) {
    if (current.includes(optionUid)) {
      return current.filter((uid) => uid !== optionUid);
    }
    return [...current, optionUid];
  }
  return [optionUid];
}

export function areBundleSelectionsValid(
  product: ProductDetailItem,
  selections: BundleSelections,
): boolean {
  for (const item of getBundleItems(product)) {
    const selected = selections[item.uid] ?? [];
    if (item.required && selected.length === 0) {
      return false;
    }
    if (!isMultiSelectBundleType(item.type) && item.required && selected.length !== 1) {
      return false;
    }
  }
  return getBundleItems(product).length > 0;
}

export function getBundleSelectedOptions(selections: BundleSelections): string[] {
  return Object.values(selections).flat();
}

export function buildBundleAddToCartInput(
  product: ProductDetailItem,
  selections: BundleSelections,
  quantity = 1,
): AddToCartItemInput {
  if (!isBundleProduct(product)) {
    throw new Error("Product is not a bundle.");
  }

  if (!areBundleSelectionsValid(product, selections)) {
    throw new Error("Please select all required bundle options.");
  }

  const qty = Math.min(999, Math.max(1, Math.floor(quantity) || 1));

  return {
    sku: product.sku,
    quantity: qty,
    selectedOptions: getBundleSelectedOptions(selections),
    isBundle: true,
  };
}

export function formatBundleOptionPrice(
  option: BundleItemOption,
  currency = "USD",
): string | null {
  const value = option.product?.price_range?.minimum_price?.final_price?.value;
  if (typeof value !== "number") {
    return null;
  }
  const resolvedCurrency =
    option.product?.price_range?.minimum_price?.final_price?.currency ?? currency;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits: 2,
  }).format(value);
}
