import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import type { ProductItem } from "@/framework/graphql/queries/products";

export function getProductUrl(product: ProductItem): string {
  return product.url_key ? `/${product.url_key}` : "#";
}

export function isBundleProduct(
  product: ProductItem | ProductDetailItem,
): product is ProductDetailItem & { __typename: "BundleProduct" } {
  return product.__typename === "BundleProduct";
}

export function isGroupedProduct(
  product: ProductItem | ProductDetailItem,
): product is ProductDetailItem & { __typename: "GroupedProduct" } {
  return product.__typename === "GroupedProduct";
}

export function requiresProductPage(product: ProductItem): boolean {
  return isBundleProduct(product) || isGroupedProduct(product);
}
