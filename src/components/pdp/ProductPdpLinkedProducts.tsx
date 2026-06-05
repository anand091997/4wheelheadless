"use client";

import { useMemo } from "react";
import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import type { ProductItem } from "@/framework/graphql/queries/products";
import ProductLinkedSlider from "./ProductLinkedSlider";

type ProductPdpLinkedProductsProps = {
  product: ProductDetailItem;
};

function dedupeLinkedProducts(
  items: ProductItem[] | null | undefined,
  currentSku: string,
): ProductItem[] {
  const seen = new Set<string>();
  const result: ProductItem[] = [];

  for (const item of items ?? []) {
    if (!item?.uid || !item.sku || item.sku === currentSku || seen.has(item.uid)) {
      continue;
    }
    seen.add(item.uid);
    result.push(item);
  }

  return result;
}

export default function ProductPdpLinkedProducts({ product }: ProductPdpLinkedProductsProps) {
  const currentSku = product.sku ?? "";

  const related = useMemo(
    () => dedupeLinkedProducts(product.related_products, currentSku),
    [product.related_products, currentSku],
  );
  const upsell = useMemo(
    () => dedupeLinkedProducts(product.upsell_products, currentSku),
    [product.upsell_products, currentSku],
  );
  const crosssell = useMemo(
    () => dedupeLinkedProducts(product.crosssell_products, currentSku),
    [product.crosssell_products, currentSku],
  );

  if (related.length === 0 && upsell.length === 0 && crosssell.length === 0) {
    return null;
  }

  return (
    <div className="col-span-full w-full">
      <ProductLinkedSlider title="Related Products" products={related} />
      <ProductLinkedSlider title="Up-Sell Products" products={upsell} />
      <ProductLinkedSlider title="Cross-Sell Products" products={crosssell} />
    </div>
  );
}
