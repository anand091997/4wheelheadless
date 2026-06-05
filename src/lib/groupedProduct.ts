import type {
  GroupedProductChild,
  ProductDetailItem,
} from "@/framework/graphql/queries/productDetail";
import type { ProductItem } from "@/framework/graphql/queries/products";
import type { AddToCartItemInput } from "@/lib/configurableProduct";
import { isGroupedProduct } from "@/lib/product";

export type { GroupedProductChild };

export type GroupedQuantities = Record<string, number>;

export function getGroupedItems(product: ProductDetailItem): GroupedProductChild[] {
  if (!isGroupedProduct(product)) {
    return [];
  }

  const items = (product.items as GroupedProductChild[] | null | undefined) ?? [];
  return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function getDefaultGroupedQuantities(product: ProductDetailItem): GroupedQuantities {
  const quantities: GroupedQuantities = {};

  for (const item of getGroupedItems(product)) {
    const sku = item.product?.sku?.trim();
    if (!sku) {
      continue;
    }
    const defaultQty = typeof item.qty === "number" && item.qty >= 0 ? item.qty : 0;
    quantities[sku] = defaultQty;
  }

  return quantities;
}

export function hasGroupedSelection(quantities: GroupedQuantities): boolean {
  return Object.values(quantities).some((qty) => qty > 0);
}

export function areGroupedQuantitiesValid(quantities: GroupedQuantities): boolean {
  return hasGroupedSelection(quantities);
}

export function buildGroupedAddToCartInputs(
  quantities: GroupedQuantities,
): AddToCartItemInput[] {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([sku, qty]) => ({
      sku,
      quantity: Math.min(999, Math.max(1, Math.floor(qty) || 1)),
    }));
}

export function getGroupedChildMaxQty(product: ProductItem): number {
  const cap = product.only_x_left_in_stock;
  if (typeof cap === "number" && cap >= 1) {
    return Math.min(99, cap);
  }
  return 99;
}

export function isGroupedChildOutOfStock(product: ProductItem | null | undefined): boolean {
  return product?.stock_status === "OUT_OF_STOCK";
}
