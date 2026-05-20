import type { ProductItem } from "@/framework/graphql/queries/products";

export function getProductUrl(product: ProductItem): string {
  return product.url_key ? `/${product.url_key}` : "#";
}

export function isBundleProduct(product: ProductItem): boolean {
  return product.__typename === "BundleProduct";
}

export function isGroupedProduct(product: ProductItem): boolean {
  return product.__typename === "GroupedProduct";
}

export function requiresProductPage(product: ProductItem): boolean {
  return isBundleProduct(product) || isGroupedProduct(product);
}
