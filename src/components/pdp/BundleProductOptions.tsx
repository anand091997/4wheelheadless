"use client";

import type { BundleItem } from "@/lib/bundleProduct";
import { formatBundleOptionPrice } from "@/lib/bundleProduct";
import type { BundleAddToCartState } from "@/hooks/useBundleAddToCart";

type BundleProductOptionsProps = {
  bundleItems: BundleItem[];
  state: BundleAddToCartState;
};

function isMultiSelectType(type: string): boolean {
  const normalized = type.toLowerCase();
  return normalized === "checkbox" || normalized === "multi";
}

export default function BundleProductOptions({
  bundleItems,
  state,
}: BundleProductOptionsProps) {
  const { selections, setBundleOption } = state;

  if (bundleItems.length === 0) {
    return (
      <p className="text-sm text-gray-600">No bundle options are configured for this product.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {bundleItems.map((item) => {
        const selected = selections[item.uid] ?? [];
        const multi = isMultiSelectType(item.type);

        return (
          <fieldset key={item.uid} className="min-w-0 border-0 p-0">
            <legend className="mb-3 text-sm font-semibold text-gray-900">
              {item.title}
              {item.required ? <span className="text-[#F50028]"> *</span> : null}
            </legend>

            {item.type.toLowerCase() === "select" ? (
              <select
                className="select-common w-full max-w-md"
                value={selected[0] ?? ""}
                onChange={(event) => {
                  const uid = event.target.value;
                  if (uid) {
                    setBundleOption(item, uid);
                  }
                }}
                aria-required={item.required}
              >
                <option value="" disabled>
                  Choose an option
                </option>
                {(item.options ?? []).map((option) => {
                  const price = formatBundleOptionPrice(option);
                  return (
                    <option key={option.uid} value={option.uid}>
                      {option.label}
                      {price ? ` (+${price})` : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div
                className="flex flex-col gap-2"
                role={multi ? "group" : "radiogroup"}
                aria-label={item.title}
              >
                {(item.options ?? []).map((option) => {
                  const isSelected = selected.includes(option.uid);
                  const price = formatBundleOptionPrice(option);
                  const childName = option.product?.name?.trim();

                  return (
                    <label
                      key={option.uid}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors ${
                        isSelected
                          ? "border-[#F50028] bg-[#fff5f7]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type={multi ? "checkbox" : "radio"}
                        name={`bundle-${item.uid}`}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#F50028]"
                        checked={isSelected}
                        onChange={() => setBundleOption(item, option.uid)}
                      />
                      <span className="min-w-0 flex-1 text-sm text-gray-900">
                        <span className="font-medium">{option.label}</span>
                        {childName && childName !== option.label ? (
                          <span className="mt-0.5 block text-gray-600">{childName}</span>
                        ) : null}
                        {price ? (
                          <span className="mt-0.5 block font-semibold text-gray-900">
                            +{price}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
