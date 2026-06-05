"use client";

import Link from "next/link";
import { MinusIcon, PlusIcon } from "@/components/Icon";
import type { GroupedAddToCartState } from "@/hooks/useGroupedAddToCart";
import { getGroupedChildMaxQty, isGroupedChildOutOfStock } from "@/lib/groupedProduct";
import { getProductUrl } from "@/lib/product";

type GroupedProductItemsProps = {
  state: GroupedAddToCartState;
};

function formatPrice(value: number | undefined, currency: string | undefined) {
  if (typeof value !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function GroupedProductItems({ state }: GroupedProductItemsProps) {
  const { groupedItems, quantities, setChildQuantity } = state;

  if (groupedItems.length === 0) {
    return (
      <p className="text-sm text-gray-600">No items are configured for this grouped product.</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="grouped-product-table w-full min-w-0 border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-900">
            <th className="py-3 pr-4 text-left font-bold">Product</th>
            <th className="hidden py-3 pr-4 text-left font-bold md:table-cell">Price</th>
            <th className="py-3 text-right font-bold">Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {groupedItems.map((item) => {
            const child = item.product;
            if (!child?.sku) {
              return null;
            }

            const sku = child.sku;
            const qty = quantities[sku] ?? 0;
            const maxQty = getGroupedChildMaxQty(child);
            const outOfStock = isGroupedChildOutOfStock(child);
            const minPrice = child.price_range?.minimum_price;
            const final = minPrice?.final_price;
            const regular = minPrice?.regular_price;
            const imageUrl = child.small_image?.url?.trim();

            return (
              <tr key={sku} className={outOfStock ? "opacity-70" : undefined}>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <Link href={getProductUrl(child)} className="shrink-0" tabIndex={-1}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={child.small_image?.label ?? child.name}
                          className="h-14 w-14 object-contain"
                        />
                      </Link>
                    ) : null}
                    <div className="min-w-0">
                      <Link
                        href={getProductUrl(child)}
                        className="text-sm font-medium text-gray-900 no-underline hover:text-[#F50028]"
                      >
                        {child.name}
                      </Link>
                      {outOfStock ? (
                        <p className="mt-1 text-xs font-medium text-red-800">Out of stock</p>
                      ) : null}
                      <p className="mt-1 font-semibold sm:hidden">
                        {formatPrice(
                          final?.value ?? regular?.value,
                          final?.currency ?? regular?.currency,
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pr-4 font-bold text-gray-900 md:table-cell">
                  {formatPrice(
                    final?.value ?? regular?.value,
                    final?.currency ?? regular?.currency,
                  )}
                </td>
                <td className="py-4">
                  <div className="flex justify-end">
                    <div className="flex items-stretch border border-[#efefef] bg-white">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-[#51565b] disabled:opacity-40"
                        aria-label={`Decrease ${child.name} quantity`}
                        disabled={outOfStock || qty <= 0}
                        onClick={() => setChildQuantity(sku, qty - 1)}
                      >
                        <MinusIcon size={18} />
                      </button>
                      <label htmlFor={`grouped-qty-${sku}`} className="sr-only">
                        Quantity for {child.name}
                      </label>
                      <input
                        id={`grouped-qty-${sku}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={maxQty}
                        value={qty}
                        disabled={outOfStock}
                        onChange={(event) =>
                          setChildQuantity(sku, Number.parseInt(event.target.value, 10) || 0)
                        }
                        className="h-10 w-12 border-x border-[#efefef] text-center text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-[#51565b] disabled:opacity-40"
                        aria-label={`Increase ${child.name} quantity`}
                        disabled={outOfStock || qty >= maxQty}
                        onClick={() => setChildQuantity(sku, qty + 1)}
                      >
                        <PlusIcon size={18} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
