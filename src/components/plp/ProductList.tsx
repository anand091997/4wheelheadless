"use client";

import type { ProductItem } from "@/framework/graphql";
import ProductCard from "./ProductCard";

type ProductListProps = {
  products: ProductItem[];
};

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.uid} product={product} compact />
      ))}
    </div>
  );
}
