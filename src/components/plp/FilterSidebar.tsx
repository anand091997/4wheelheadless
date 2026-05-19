"use client";

import { useMemo, useState } from "react";
import { ArrowDownIcon } from "@/components/Icon";
import type { ProductAggregation } from "@/framework/graphql";
import { getAppliedFilters, hasAppliedFilters } from "./filterUtils";
import type { FilterSelection } from "./types";

type FilterSidebarProps = {
  aggregations: ProductAggregation[];
  selectedFilters: FilterSelection;
  onToggleFilter: (attributeCode: string, value: string) => void;
  onClearFilters: () => void;
  initiallyOpenCount?: number;
};

export default function FilterSidebar({
  aggregations,
  selectedFilters,
  onToggleFilter,
  onClearFilters,
  initiallyOpenCount = 3,
}: FilterSidebarProps) {
  const [openCodes, setOpenCodes] = useState<Set<string>>(
    () =>
      new Set(
        aggregations
          .slice(0, initiallyOpenCount)
          .map((a) => a.attribute_code)
      )
  );

  const appliedFilters = useMemo(
    () => getAppliedFilters(selectedFilters, aggregations),
    [selectedFilters, aggregations]
  );

  const showAppliedFilters = hasAppliedFilters(selectedFilters);

  const toggle = (code: string) => {
    setOpenCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  return (
    <aside className="bg-white lg:bg-[#f4f4f4] p-4 lg:min-h-full">
      {showAppliedFilters ? (
        <div className="pb-4 mb-4 border-b border-gray-300 -mx-4 px-4">
          <h2 className="mb-3 font-semibold uppercase text-base">Filter By:</h2>
          <ul className="items am-filter pt-1 pb-3 flex flex-wrap gap-2">
            {appliedFilters.map((filter) => (
              <li key={`${filter.attributeCode}-${filter.value}`}>
                <div className="amshopby-remove-item bg-white border border-gray-200 rounded-sm px-2 py-1 flex gap-x-2 justify-between items-center">
                  <span className="min-w-0 flex-1 truncate leading-snug">{filter.label}</span>
                  <button
                    type="button"
                    onClick={() => onToggleFilter(filter.attributeCode, filter.value)}
                    className="shrink-0 text-base leading-none text-[#F50028] hover:text-[#d40024]"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-primary-darker hover:text-primary underline"
          >
            Clear All
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {aggregations.map((aggregation) => {
          const isOpen = openCodes.has(aggregation.attribute_code);

          return (
            <section
              key={aggregation.attribute_code}
              className="border-t border-gray-300 pt-4 first:border-t-0 first:pt-0"
            >
              <button
                type="button"
                onClick={() => toggle(aggregation.attribute_code)}
                className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-gray-800"
                aria-expanded={isOpen}
              >
                <span className="truncate">{aggregation.label}</span>
                <ArrowDownIcon
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"} text-gray-500`}
                />
              </button>

              {isOpen ? (
                <ul className="mt-3 space-y-2">
                  {aggregation.options.map((option) => {
                    const checked =
                      selectedFilters[aggregation.attribute_code]?.includes(option.value) ?? false;

                    return (
                      <li key={option.value}>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleFilter(aggregation.attribute_code, option.value)}
                            className="h-4 w-4 accent-[#F50028]"
                          />
                          <span className="truncate">{option.label}</span>
                          <span className="ml-auto shrink-0 text-xs text-gray-500">
                            ({option.count})
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
