"use client";

import type { ProductItem } from "@/framework/graphql";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: ProductItem[];
  /** Desktop filter sidebar open — narrower product area, max 3 columns */
  isSidebarOpen?: boolean;
};

export default function ProductGrid({ products, isSidebarOpen = false }: ProductGridProps) {
  return (
    <div
      className={
        isSidebarOpen
          ? "grid grid-cols-1 gap-4 @sm:grid-cols-2 @3xl:grid-cols-3"
          : "grid grid-cols-1 gap-4 @sm:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.uid} product={product} />
      ))}
    </div>
  );
}
