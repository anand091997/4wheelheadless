"use client";

import type { ProductItem } from "@/framework/graphql";
import ProductTableRow from "./ProductTableRow";

type ProductTableProps = {
  products: ProductItem[];
};

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="product-table-layout w-full border-separate border-spacing-y-3">
        <thead className="bg-[#f4f4f4]">
          <tr>
            <th className="px-4 py-3.5 text-left text-sm font-semibold">Image</th>
            <th className="px-2 py-3.5 text-left text-sm font-semibold">Item</th>
            <th className="px-2 py-3.5 text-left text-sm font-semibold">SKU</th>
            <th className="px-2 py-3.5 text-left text-sm font-semibold">Price</th>
            <th className="px-2 py-3.5 text-left text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductTableRow key={product.uid} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
